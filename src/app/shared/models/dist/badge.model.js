"use strict";
exports.__esModule = true;
exports.BadgeAssigned = exports.BadgeDefaults = void 0;
var notification_model_1 = require("./notification.model");
exports.BadgeDefaults = {
    id: null,
    badge_id: null,
    name: '',
    description: '',
    notifications: notification_model_1.NotificationDefaults,
    recurrence: 'days',
    recurrence_length: 1,
    recurrence_type: 'Expires-after',
    status: 'active',
    meta: {
        timezone: 'Asia/Manila',
        bg_color: 'FFFFFF',
        image: null
    },
    ubt_toggle_status: false,
    template_id: '',
    template_status: 'new',
    player_one_toggle_status: false,
    public_id: '',
    coverage: 'any',
    groups: [],
    claims: [],
    external: true,
    hash: '',
    labels: []
};
exports.BadgeAssigned = {
    id: null,
    badge_id: '',
    claim_id: '',
    user_ids: '',
    application: '',
    created_user_id: '',
    status: 'active',
    enabled_at: new Date(),
    expired_at: '',
    remarks: '',
    meta: {
        acquired_date: '',
        acquired_time: ''
    },
    user: {
        username: '',
        name: '',
        code: '',
        meta: {
            timezone: 'Asia/Manila',
            bg_color: 'FFFFFF',
            image: null
        }
    },
    badge: {
        name: '',
        meta: {
            timezone: 'Asia/Manila',
            bg_color: 'FFFFFF',
            image: null
        }
    },
    creator: {
        username: '',
        name: '',
        code: '',
        meta: {
            timezone: 'Asia/Manila',
            bg_color: 'FFFFFF',
            image: null
        }
    }
};
