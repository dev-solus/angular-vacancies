import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  mobileMap = new Map();
  getResult: string = '';
  isDev = false; // !environment.production;

  protected platformId = inject(PLATFORM_ID);

  getOld(item): Promise<any> {
    if (this.isDev) {
      return this.localStorageWrapper.getItem(item) as any;
    }

    return new Promise((resolve, reject) => {
      const r = this.localStorageWrapper.getItem(item);
      resolve(r);
    });
  }

  get(item) {
    if (this.isDev) {
      return this.localStorageWrapper.getItem(item) as any;
    }

    return this.localStorageWrapper.getItem(item);
  }

   set(key, value) {
    this.localStorageWrapper.setItem(key, value);
  }

  removeItem(item) {
    this.localStorageWrapper.removeItem(item);
  }

  get localStorageWrapper() {
    const isBrowser = isPlatformBrowser(this.platformId);
    
    
    if (isBrowser) {
      return {
        setItem: (key: string, value: string) => localStorage.setItem(key, value),
        getItem: (key: string) => localStorage.getItem(key),
        removeItem: (key: string) => localStorage.removeItem(key),
      }
    }

    var map: Map< string, string> = new Map();

    return {
      setItem: (key: string, value: string) => map.set(key, value),
      getItem: (key: string) => map.get(key),
      removeItem: (key: string) => map.delete(key),
    }
  }
}
