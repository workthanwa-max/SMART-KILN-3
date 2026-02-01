import Dexie, { type Table } from 'dexie';

export interface User {
    user_id?: number;
    name: string;
    phone: string;
    role: 'researcher' | 'operator';
    is_active: number;
    must_change_password?: number;
    sync_status?: 'synced' | 'pending_create' | 'pending_update';
}

export interface Kiln {
    kiln_id?: number;
    name: string;
    location: string;
    latitude?: number;
    longitude?: number;
    note: string;
    is_active: number;
    sync_status?: 'synced' | 'pending_create' | 'pending_update';
}

export interface Experiment {
    experiment_id?: number;
    operator_id: number;
    kiln_id: number;
    burn_hours: number;
    charcoal_weight?: number;
    bag_count?: number;
    quality_grade?: string;
    initial_moisture?: string;
    final_moisture?: string;
    wood_vinegar_quantity?: number;
    temperature?: number;
    summary_note?: string;
    created_at?: string;
    sync_status?: 'synced' | 'pending_create' | 'pending_update';
}

export interface ExperimentMaterial {
    id?: number;
    experiment_id: number;
    wood_type: string;
    quantity: number;
    condition: 'dry' | 'fresh';
    sync_status?: 'synced' | 'pending_create' | 'pending_update';
}

export interface UserKiln {
    id?: number;
    user_id: number;
    kiln_id: number;
    sync_status?: 'synced' | 'pending_create' | 'pending_delete';
}

export class AppDatabase extends Dexie {
    users!: Table<User>;
    kilns!: Table<Kiln>;
    experiments!: Table<Experiment>;
    experiment_materials!: Table<ExperimentMaterial>;
    user_kilns!: Table<UserKiln>;

    constructor() {
        super('CharcoalOfflineDB');
        this.version(2).stores({
            users: '++user_id, phone, role, is_active, sync_status',
            kilns: '++kiln_id, name, is_active, sync_status',
            experiments: '++experiment_id, operator_id, kiln_id, sync_status',
            experiment_materials: '++id, experiment_id, sync_status',
            user_kilns: '++id, user_id, kiln_id, sync_status'
        });
    }
}

export const db = new AppDatabase();
