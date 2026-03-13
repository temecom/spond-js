import { Spond } from '../src';
import { TestContext } from './types';

export class Tester {
    private logger;
    private config;
    private spond: Spond | null = null;
    private username: string | null = null;
    private groupId: string | null = null;
    private eventId: string | null = null;

    constructor(context: TestContext) {
        this.logger = context.logger;
        this.config = context.config;
    }

    private async setup() {
        this.username = this.config.get('username');
        const password = this.config.get('password');
        this.groupId = this.config.get('groupId');
        this.eventId = this.config.get('eventId');

        if (!this.username || !password || !this.groupId || !this.eventId) {
            const msg = "Error: 'username', 'password', 'groupId' and 'eventId' must be set.";
            this.logger.error(msg);
            throw new Error(msg);
        }
        
        this.spond = new Spond(this.username, password);
        await this.spond.login();
        this.logger.log(`Logged in as ${this.username}`);
    }

    async test__when_getGroup_is_called__then_group_is_returned() {
        this.logger.log("Running test: test__when_getGroup_is_called__then_group_is_returned");
        if (!this.spond || !this.groupId) throw new Error("Not initialized");
        const group = await this.spond.getGroup(this.groupId);
        this.logger.log(`Fetched Group: ${JSON.stringify(group, null, 2)}`);
    }

    async test__when_getEvents_is_called__then_events_are_returned() {
        this.logger.log("Running test: test__when_getEvents_is_called__then_events_are_returned");
         if (!this.spond || !this.groupId) throw new Error("Not initialized");
         this.logger.log("Upcoming events:");
         const events = await this.spond.getEvents(this.groupId, null, false, false, null, new Date());
         this.logger.log(`Events: ${JSON.stringify(events, null, 2)}`);
    }

    async test__when_getEvent_is_called__then_attendees_are_retrieved() {
        this.logger.log("Running test: test__when_getEvent_is_called__then_attendees_are_retrieved");
        if (!this.spond || !this.eventId) throw new Error("Not initialized");
        
        this.logger.log(`Getting attendees for event ${this.eventId}...`);
        const event = await this.spond.getEvent(this.eventId);
        
        if (event && event.responses && event.responses.acceptedIds && event.responses.acceptedIds.length > 0) {
            this.logger.log("Attendees:");
            for (const memberId of event.responses.acceptedIds) {
                try {
                    const member = await this.spond.getPerson(memberId);
                    this.logger.log(`- ${member.firstName} ${member.lastName}: ${member.email}`);
                } catch (e) {
                    this.logger.log(`- Unknown member (ID: ${memberId})`);
                }
            }
        } else {
            this.logger.log("No attendees found.");
        }
    }

    async runAll() {
        try {
            await this.setup();
            await this.test__when_getGroup_is_called__then_group_is_returned();
            await this.test__when_getEvents_is_called__then_events_are_returned();
            await this.test__when_getEvent_is_called__then_attendees_are_retrieved();
            this.logger.log("All tests completed successfully.");
        } catch (e: any) {
             this.logger.error(`Test execution failed: ${e.message}`);
             if (e.stack) this.logger.error(e.stack);
        }
    }
}
