// Module contains template event data, to be used as a base when updating events.

export interface Location {
    id: string | null;
    feature: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
}

export interface Owner {
    id: string | null;
}

export interface Payment {
    [key: string]: any;
}

export interface Assignment {
    memberIds: string[];
    profiles: any[];
    remove: any[];
}

export interface AssignedTask {
    name: string | null;
    description: string;
    type: string;
    id: string | null;
    adultsOnly: boolean;
    assignments: Assignment;
}

export interface Tasks {
    openTasks: any[];
    assignedTasks: AssignedTask[];
}

export interface EventTemplate {
    heading: string | null;
    description: string | null;
    spondType: string;
    startTimestamp: string | null;
    endTimestamp: string | null;
    commentsDisabled: boolean;
    maxAccepted: number;
    rsvpDate: string | null;
    location: Location;
    owners: Owner[];
    visibility: string;
    participantsHidden: boolean;
    autoReminderType: string;
    autoAccept: boolean;
    payment: Payment;
    attachments: any[];
    id: string | null;
    tasks: Tasks;
    [key: string]: any; // Allow for extra properties
}

export const EVENT_TEMPLATE: EventTemplate = {
    heading: null,
    description: null,
    spondType: "EVENT",
    startTimestamp: null,
    endTimestamp: null,
    commentsDisabled: false,
    maxAccepted: 0,
    rsvpDate: null,
    location: {
        id: null,
        feature: null,
        address: null,
        latitude: null,
        longitude: null,
    },
    owners: [{ id: null }],
    visibility: "INVITEES",
    participantsHidden: false,
    autoReminderType: "DISABLED",
    autoAccept: false,
    payment: {},
    attachments: [],
    id: null,
    tasks: {
        openTasks: [],
        assignedTasks: [
            {
                name: null,
                description: "",
                type: "ASSIGNED",
                id: null,
                adultsOnly: true,
                assignments: { memberIds: [], profiles: [], remove: [] },
            },
        ],
    },
};
