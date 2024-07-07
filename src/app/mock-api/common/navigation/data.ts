/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'job',
        title: 'Emploi',
        // subtitle: 'Gestion des profils',
        icon: 'heroicons_outline:academic-cap',
        type: 'basic',
        link: '/admin/job',
    },

    {
        id: 'Management',
        title: 'Management',
        type: 'collapsable',
        icon: 'heroicons_outline:adjustments-vertical',
        subtitle: 'Admin management',
        // link: '',
        children: [
            {
                id: 'config',
                title: 'Config',
                // subtitle: 'Gestion des config',
                // icon: 'heroicons_outline:cog',
                type: 'basic',
                link: '/admin/config',
            },
            {
                id: 'filter',
                title: 'Filter',
                // subtitle: 'Gestion des profils',
                // icon: 'heroicons_outline:cog',
                type: 'basic',
                link: '/admin/filter',
            },
        ]
    },
    {
        id: 'settings',
        title: 'Settings',
        type: 'collapsable',
        icon: 'heroicons_outline:cog',
        subtitle: 'Admin Paramètres',
        // link: '',
        children: [

            {
                id: 'User',
                title: 'Utilisateur',
                subtitle: 'Gestion des utilisateurs',
                // icon: 'heroicons_outline:cog',
                type: 'basic',
                link: '/admin/user',
            },
            {
                id: 'role',
                title: 'Role',
                subtitle: 'Gestion des profils',
                // icon: 'heroicons_outline:cog',
                type: 'basic',
                link: '/admin/role',
            },
        ]
    },



];
export const compactNavigation: FuseNavigationItem[] = [...defaultNavigation];
export const futuristicNavigation: FuseNavigationItem[] = [...defaultNavigation];
export const horizontalNavigation: FuseNavigationItem[] = [...defaultNavigation];
