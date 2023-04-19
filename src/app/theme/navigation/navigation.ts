import { FuseNavigation } from '@fuse/types';

export const navigation: FuseNavigation[] = [
    {
        id       : 'general',
        title    : 'General',
        translate: 'NAV.GENERAL',
        type     : 'group',
        children : [
            {
                id       : 'dashboard',
                title    : 'My Badges',
                translate: 'NAV.DASHBOARD',
                type     : 'item',
                icon     : 'dashboard',
                url      : '/dashboard',
            }
        ]
    },
    {
        id       : 'applications',
        title    : 'Applications',
        translate: 'NAV.APPLICATIONS',
        type     : 'group',
        children : [
            {
                id       : 'badges',
                title    : 'Sample',
                translate: 'NAV.BADGES.TITLE',
                type     : 'item',
                icon     : 'card_giftcard',
                url      : '/badges'
            },
            {
                id       : 'badgeboard',
                title    : 'Badge Board',
                translate: 'NAV.BADGEBOARD',
                type     : 'item',
                icon     : 'developer_board',
                url      : '/boards',
            },
        ]
    },
    {
        id       : 'management',
        title    : 'Management',
        translate: 'NAV.MANAGEMENT',
        type     : 'group',
        children : [
            {
                id       : 'groups',
                title    : 'Groups',
                translate: 'NAV.GROUPS.TITLE',
                type     : 'item',
                icon     : 'group_work',
                url      : '/groups'
            },
            {
                id       : 'users',
                title    : 'Users',
                translate: 'NAV.USERS.TITLE',
                type     : 'item',
                icon     : 'people',
                url      : '/users'
            },
            {
                id       : 'reports',
                title    : 'Reports',
                translate: 'NAV.REPORTS.TITLE',
                type     : 'collapsable',
                icon     : 'assignment',
                children : [
                    {
                        id   : 'report-users',
                        title: 'Users',
                        type : 'item',
                        url  : '/reports/users'
                    },
                    {
                        id   : 'report-badges',
                        title: 'Badges',
                        type : 'item',
                        url  : '/reports/badges'
                    }
                ]
            }
        ]
    }
];
