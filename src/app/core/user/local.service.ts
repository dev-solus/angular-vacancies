import { Injectable, computed, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { User } from '../api';

type UserClient = User
const USER = 'user-client';
const TOKEN = 'token-client';

@Injectable({
    providedIn: 'root'
})
export class LocalService {
    readonly storageService = inject(StorageService)
    readonly user = signal<UserClient>(null);
    readonly isSignin = signal(false);
    public token = '';
    readonly isAdmin = computed(() => this.user()?.role.name === 'AGENT_GUICHET');

    constructor() {
        this.getLocal();
    }
    // se connecter
    public login(user: UserClient, token: string) {
        if (!user || !token) {
            return;
        }

        this.user.set(user)
        this.token = token;

        this.storageService.set(TOKEN, (JSON.stringify(this.token)));
        this.storageService.set(USER, (JSON.stringify(user)))

        this.isSignin.set(true)
    }

    public updateUser(user: UserClient) {
        if (!user) {
            return;
        }
        this.user.set(user);
        this.storageService.set(USER, (JSON.stringify(this.user())));
    }

    getFromLocal(key: string) {
        try {
            return JSON.parse(this.storageService.get(key))
        } catch (error) {
            return null
        }
    }

    // se deconnecter
    public logout(): void {
        this.user.set(null);
        this.storageService.removeItem(USER);
        this.storageService.removeItem(TOKEN);
        this.isSignin.set(false)
    }

    public  getLocal() {
        try {
            this.user.set(JSON.parse(this.storageService.get(USER)))
            this.token = JSON.parse( this.storageService.get(TOKEN));
            this.isSignin.set(!!this.user())
        } catch (error) {
            this.user.set(null);
            this.token = '';
            this.isSignin.set(false)
        }
    }
}
