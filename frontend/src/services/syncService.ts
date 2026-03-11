import { Network } from '@capacitor/network';
import { db } from '../db/db';
import api from '../api';

class SyncService {
    private isSyncing = false;

    constructor() {
        this.initNetworkListener();
    }

    private initNetworkListener() {
        Network.addListener('networkStatusChange', (status: any) => {
            console.log('Network status changed', status);
            if (status.connected) {
                this.syncPendingChanges();
            }
        });
    }

    async isOnline() {
        const status = await Network.getStatus();
        return status.connected;
    }

    // Helper to remove local items that don't exist on server anymore
    private async pruneLocalData(tableName: string, serverItems: any[], idField: string) {
        try {
            const serverIds = new Set(serverItems.map(item => item[idField]));
            const localItems = await db.table(tableName).toArray();

            const idsToDelete = localItems
                .filter(item =>
                    item[idField] !== undefined && // Has an ID
                    !serverIds.has(item[idField]) && // Not in server list
                    item.sync_status !== 'pending_create' // Not a new local item waiting to be pushed
                )
                .map(item => item[idField]);

            if (idsToDelete.length > 0) {
                console.log(`Pruning ${idsToDelete.length} obsolete items from ${tableName}`);
                await db.table(tableName).bulkDelete(idsToDelete);
            }
        } catch (error) {
            console.error(`Failed to prune ${tableName}:`, error);
        }
    }

    // Pull all data from server to local DB
    async pullFromServer() {
        if (!(await this.isOnline())) return;

        try {
            // Pull Users
            const usersRes = await api.get('/users');
            if (Array.isArray(usersRes.data)) {
                await this.pruneLocalData('users', usersRes.data, 'user_id');
                await db.users.bulkPut(usersRes.data.map((u: any) => ({ ...u, sync_status: 'synced' })));
            }

            // Pull Kilns
            const kilnsRes = await api.get('/kilns');
            if (Array.isArray(kilnsRes.data)) {
                await this.pruneLocalData('kilns', kilnsRes.data, 'kiln_id');
                await db.kilns.bulkPut(kilnsRes.data.map((k: any) => ({ ...k, sync_status: 'synced' })));
            }

            // Pull Experiments
            const experimentsRes = await api.get('/experiments');
            if (Array.isArray(experimentsRes.data)) {
                await this.pruneLocalData('experiments', experimentsRes.data, 'experiment_id');
                await db.experiments.bulkPut(experimentsRes.data.map((e: any) => ({ ...e, sync_status: 'synced' })));
            }

            // Pull User-Kiln Assignments
            const userKilnsRes = await api.get('/user-kilns');
            if (Array.isArray(userKilnsRes.data)) {
                await this.pruneLocalData('user_kilns', userKilnsRes.data, 'id');
                await db.user_kilns.bulkPut(userKilnsRes.data.map((uk: any) => ({ ...uk, sync_status: 'synced' })));
            }

            console.log('Successfully pulled and validated data from server');
        } catch (error) {
            console.error('Failed to pull data from server', error);
        }
    }

    // Push pending local changes to server
    async syncPendingChanges() {
        if (this.isSyncing) return;
        if (!(await this.isOnline())) return;

        this.isSyncing = true;
        try {
            // Sync Users (Create/Update)
            const pendingUsers = await db.users.where('sync_status').notEqual('synced').toArray();
            for (const user of pendingUsers) {
                try {
                    if (user.sync_status === 'pending_create') {
                        const res = await api.post('/users', user);
                        await db.users.update(user.user_id!, { ...res.data, sync_status: 'synced' });
                    } else if (user.sync_status === 'pending_update') {
                        await api.put(`/users/${user.user_id}`, user);
                        await db.users.update(user.user_id!, { sync_status: 'synced' });
                    }
                } catch (err: any) {
                    console.error(`Failed to sync user ${user.user_id}:`, err);
                    if (err.response) {
                        // 404 Not Found on Update -> Delete local ghost item
                        if (err.response.status === 404 && user.sync_status === 'pending_update') {
                            console.log(`User ${user.user_id} not found on server. Deleting local copy.`);
                            await db.users.delete(user.user_id!);
                        }
                        // 400 Bad Request -> Mark as synced to stop retry
                        else if (err.response.status >= 400 && err.response.status < 500) {
                            await db.users.update(user.user_id!, { sync_status: 'synced' });
                        }
                    }
                }
            }

            // Sync Kilns
            const pendingKilns = await db.kilns.where('sync_status').notEqual('synced').toArray();
            for (const kiln of pendingKilns) {
                try {
                    if (kiln.sync_status === 'pending_create') {
                        const res = await api.post('/kilns', kiln);
                        await db.kilns.update(kiln.kiln_id!, { ...res.data, sync_status: 'synced' });
                    } else if (kiln.sync_status === 'pending_update') {
                        await api.put(`/kilns/${kiln.kiln_id}`, kiln);
                        await db.kilns.update(kiln.kiln_id!, { sync_status: 'synced' });
                    }
                } catch (err: any) {
                    console.error(`Failed to sync kiln ${kiln.kiln_id}:`, err);
                    if (err.response) {
                        // 404 Not Found on Update -> Delete local ghost item
                        if (err.response.status === 404 && kiln.sync_status === 'pending_update') {
                            console.log(`Kiln ${kiln.kiln_id} not found on server. Deleting local copy.`);
                            await db.kilns.delete(kiln.kiln_id!);
                        }
                        else if (err.response.status >= 400 && err.response.status < 500) {
                            await db.kilns.update(kiln.kiln_id!, { sync_status: 'synced' });
                        }
                    }
                }
            }

            // Sync Experiments
            const pendingExps = await db.experiments.where('sync_status').notEqual('synced').toArray();
            for (const exp of pendingExps) {
                try {
                    // This is a simplified sync logic
                    // In a real app, you'd handle materials too
                    if (exp.sync_status === 'pending_create') {
                        const res = await api.post('/experiments', exp);
                        await db.experiments.update(exp.experiment_id!, { ...res.data, sync_status: 'synced' });
                    } else if (exp.sync_status === 'pending_update') {
                        await api.put(`/experiments/${exp.experiment_id}`, exp);
                        await db.experiments.update(exp.experiment_id!, { sync_status: 'synced' });
                    }
                } catch (err: any) {
                    console.error(`Failed to sync experiment ${exp.experiment_id}:`, err);
                    if (err.response) {
                        // 404 Not Found on Update -> Delete local ghost item
                        if (err.response.status === 404 && exp.sync_status === 'pending_update') {
                            console.log(`Experiment ${exp.experiment_id} not found on server. Deleting local copy.`);
                            await db.experiments.delete(exp.experiment_id!);
                        }
                        else if (err.response.status >= 400 && err.response.status < 500) {
                            await db.experiments.update(exp.experiment_id!, { sync_status: 'synced' });
                        }
                    }
                }
            }

            // Sync user_kilns
            const pendingUKs = await db.user_kilns.where('sync_status').notEqual('synced').toArray();
            for (const uk of pendingUKs) {
                try {
                    if (uk.sync_status === 'pending_create') {
                        await api.post(`/users/${uk.user_id}/kilns`, { kiln_id: uk.kiln_id });
                        await db.user_kilns.update(uk.id!, { sync_status: 'synced' });
                    } else if (uk.sync_status === 'pending_delete') {
                        await api.delete(`/users/${uk.user_id}/kilns/${uk.kiln_id}`);
                        await db.user_kilns.delete(uk.id!);
                    }
                } catch (err: any) {
                    console.error(`Failed to sync user_kiln ${uk.id}:`, err);
                    if (err.response && (err.response.status >= 400 && err.response.status < 500)) {
                        await db.user_kilns.update(uk.id!, { sync_status: 'synced' });
                    }
                }
            }

            console.log('Successfully synced all pending changes');
        } catch (error) {
            console.error('Failed to sync pending changes', error);
        } finally {
            this.isSyncing = false;
        }
    }
}

export const syncService = new SyncService();
