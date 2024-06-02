/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [

    {
        id: 'config',
        title: 'Config',
        subtitle: 'Gestion des config',
        icon: 'heroicons_outline:cog',
        type: 'basic',
        link: '/admin/config',
    },
    {
        id: 'job',
        title: 'job',
        subtitle: 'Gestion des profils',
        icon: 'heroicons_outline:cog',
        type: 'basic',
        link: '/admin/job',
    },
    {
        id: 'User',
        title: 'Utilisateur',
        subtitle: 'Gestion des utilisateurs',
        icon: 'heroicons_outline:cog',
        type: 'basic',
        link: '/admin/user',
    },
    {
        id: 'role',
        title: 'Role',
        subtitle: 'Gestion des profils',
        icon: 'heroicons_outline:cog',
        type: 'basic',
        link: '/admin/role',
    },
    // {
    //     id: 'settings',
    //     title: 'Settings',
    //     type: 'collapsable',
    //     icon: 'heroicons_outline:cog',
    //     subtitle: 'Admin Paramètres',
    //     // link: '',
    //     children: [
    //         {
    //             id: 'Role',
    //             title: 'Role',
    //             type: 'basic',
    //             link: '/admin/role',
    //         },
    //     ]
    // },



];
export const compactNavigation: FuseNavigationItem[] = [...defaultNavigation];
export const futuristicNavigation: FuseNavigationItem[] = [...defaultNavigation];
export const horizontalNavigation: FuseNavigationItem[] = [...defaultNavigation];
