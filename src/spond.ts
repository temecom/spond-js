import { SpondBase, requireAuthentication, JSONDict, AuthenticationError } from './base';
import { EVENT_TEMPLATE, EventTemplate } from './eventTemplate';
import { AxiosResponse } from 'axios';

export class Spond extends SpondBase {
    private static readonly API_BASE_URL = "https://api.spond.com/core/v1/";
    private static readonly DT_FORMAT = "YYYY-MM-DDTHH:mm:ss.SSSZ"; // Note: date-fns or moment format string style, but native JS Date used internally
    private static readonly EVENT_TEMPLATE = EVENT_TEMPLATE;
    private static readonly EVENT = "event";
    private static readonly GROUP = "group";

    private chatUrl: string | null = null;
    private auth: string | null = null; // Defines chat auth token
    public groups: JSONDict[] | null = null;
    public events: JSONDict[] | null = null;
    public messages: JSONDict[] | null = null;
    public profile: JSONDict | null = null;

    constructor(username: string, password: string) {
        super(username, password, Spond.API_BASE_URL);
    }

    private async loginChat(): Promise<void> {
        const apiChatUrl = `${this.apiUrl}chat`;
        const r = await this.client.post(apiChatUrl, {}, { headers: this.authHeaders });
        const result = r.data;
        this.chatUrl = result["url"];
        this.auth = result["auth"];
    }

    @requireAuthentication
    async getProfile(): Promise<JSONDict> {
        const url = `${Spond.API_BASE_URL}profile`;
        const r = await this.client.get(url, { headers: this.authHeaders });
        this.profile = r.data;
        return this.profile!;
    }

    @requireAuthentication
    async getGroups(): Promise<JSONDict[] | null> {
        const url = `${this.apiUrl}groups/`;
        const r = await this.client.get(url, { headers: this.authHeaders });
        this.groups = r.data;
        return this.groups;
    }

    async getGroup(uid: string): Promise<JSONDict> {
        return await this.getEntity(Spond.GROUP, uid);
    }

    @requireAuthentication
    async getPerson(user: string): Promise<JSONDict> {
        if (!this.groups) {
            await this.getGroups();
        }
        
        if (this.groups) {
            for (const group of this.groups) {
                // Check members
                if (group["members"]) {
                    for (const member of group["members"]) {
                        if (this.matchPerson(member, user)) {
                            return member;
                        }
                        // Check guardians
                        if (member["guardians"]) {
                            for (const guardian of member["guardians"]) {
                                if (this.matchPerson(guardian, user)) {
                                    return guardian;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        throw new Error(`No person matched with identifier '${user}'.`);
    }

    private matchPerson(person: JSONDict, matchStr: string): boolean {
        return (
            person["id"] === matchStr ||
            (person["email"] && person["email"] === matchStr) ||
            `${person["firstName"]} ${person["lastName"]}` === matchStr ||
            (person["profile"] && person["profile"]["id"] === matchStr)
        );
    }

    @requireAuthentication
    async getMessages(maxChats: number = 100): Promise<JSONDict[] | null> {
        if (!this.auth) {
            await this.loginChat();
        }
        const url = `${this.chatUrl}/chats/`;
        const r = await this.client.get(url, {
            headers: { "auth": this.auth },
            params: { "max": maxChats.toString() }
        });
        this.messages = r.data;
        return this.messages;
    }

    @requireAuthentication
    private async continueChat(chatId: string, text: string): Promise<JSONDict> {
        if (!this.auth) {
            await this.loginChat();
        }
        const url = `${this.chatUrl}/messages`;
        const data = { "chatId": chatId, "text": text, "type": "TEXT" };
        const r = await this.client.post(url, data, { headers: { "auth": this.auth } });
        return r.data;
    }

    @requireAuthentication
    async sendMessage(text: string, user: string | null = null, groupUid: string | null = null, chatId: string | null = null): Promise<JSONDict> {
        if (!this.auth) {
            await this.loginChat();
        }

        if (chatId !== null) {
            return this.continueChat(chatId, text);
        }
        if (groupUid === null || user === null) {
            return {
                "error": "wrong usage, group_id and user_id needed or continue chat with chat_id"
            };
        }

        const userObj = await this.getPerson(user);
        let userUid: string;
        if (userObj) {
            userUid = userObj["profile"]["id"];
        } else {
            return { error: "User not found" }; // Changed return type to match JSONDict
        }

        const url = `${this.chatUrl}/messages`;
        const data = {
            "text": text,
            "type": "TEXT",
            "recipient": userUid,
            "groupId": groupUid,
        };
        const r = await this.client.post(url, data, { headers: { "auth": this.auth } });
        return r.data;
    }

    @requireAuthentication
    async getEvents(
        groupId: string | null = null,
        subgroupId: string | null = null,
        includeScheduled: boolean = false,
        includeHidden: boolean = false,
        maxEnd: Date | null = null,
        minEnd: Date | null = null,
        maxStart: Date | null = null,
        minStart: Date | null = null,
        maxEvents: number = 100
    ): Promise<JSONDict[] | null> {
        const url = `${this.apiUrl}sponds/`;
        const params: JSONDict = {
            "max": maxEvents.toString(),
            "scheduled": includeScheduled.toString(),
        };

        const formatDate = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, 'Z'); // Basic ISO format, adjust if API is strict

        if (maxEnd) params["maxEndTimestamp"] = maxEnd.toISOString();
        if (maxStart) params["maxStartTimestamp"] = maxStart.toISOString();
        if (minEnd) params["minEndTimestamp"] = minEnd.toISOString();
        if (minStart) params["minStartTimestamp"] = minStart.toISOString();
        if (groupId) params["groupId"] = groupId;
        if (subgroupId) params["subGroupId"] = subgroupId;
        if (includeHidden) params["includeHidden"] = "true";

        try {
            const r = await this.client.get(url, { headers: this.authHeaders, params });
            this.events = r.data;
            return this.events;
        } catch (error: any) {
             throw new Error(`Request failed: ${error.message}`);
        }
    }

    async getEvent(uid: string): Promise<JSONDict> {
         return await this.getEntity(Spond.EVENT, uid);
    }

    @requireAuthentication
    async updateEvent(uid: string, updates: JSONDict): Promise<JSONDict[] | null> {
        const event = await this.getEntity(Spond.EVENT, uid);
        const url = `${this.apiUrl}sponds/${uid}`;

        const baseEvent: JSONDict = { ...Spond.EVENT_TEMPLATE };
        
        for (const key in baseEvent) {
             // Logic: keep existing value if updates doesn't change it, else override if updates has it
            if (event[key] !== undefined && event[key] !== null && !updates[key]) {
                baseEvent[key] = event[key];
            } else if (updates[key] !== undefined && updates[key] !== null) {
                baseEvent[key] = updates[key];
            }
        }

        const r = await this.client.post(url, baseEvent, { headers: this.authHeaders });
        // self.events_update = await r.json() - seemingly unused in python code except to assign to self.events_update?
        // return self.events
        return this.events; 
    }

    @requireAuthentication
    async getEventAttendanceXlsx(uid: string): Promise<Buffer> {
        const url = `${this.apiUrl}sponds/${uid}/export`;
        const r = await this.client.get(url, { 
            headers: this.authHeaders,
            responseType: 'arraybuffer'
        });
        return Buffer.from(r.data);
    }

    @requireAuthentication
    async changeResponse(uid: string, user: string, payload: JSONDict): Promise<JSONDict> {
        const url = `${this.apiUrl}sponds/${uid}/responses/${user}`;
        const r = await this.client.put(url, payload, { headers: this.authHeaders });
        return r.data;
    }

    @requireAuthentication
    private async getEntity(entityType: string, uid: string): Promise<JSONDict> {
        let entities: JSONDict[] | null = null;

        if (entityType === Spond.EVENT) {
            if (!this.events) {
                await this.getEvents();
            }
            entities = this.events;
        } else if (entityType === Spond.GROUP) {
            if (!this.groups) {
                await this.getGroups();
            }
            entities = this.groups;
        } else {
            throw new Error(`Entity type '${entityType}' is not supported.`);
        }

        if (entities) {
            for (const entity of entities) {
                if (entity["id"] === uid) {
                    return entity;
                }
            }
        }
        
        throw new Error(`No ${entityType} with id='${uid}'.`);
    }
}
