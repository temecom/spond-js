import { Spond } from '../src';
import { TestContext, Logger, TestConfig } from './types';
import { expect } from 'chai';

export class Tester {
    private logger: Logger;
    private config: TestConfig;
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
        this.logger.info(`Logged in as ${this.username}`);
    }

    async test__when_getGroup_is_called__then_group_is_returned() {
        this.logger.info("Running test: test__when_getGroup_is_called__then_group_is_returned");
        if (!this.spond || !this.groupId) throw new Error("Not initialized");
        const group = await this.spond.getGroup(this.groupId);
        this.logger.debug(`Fetched Group: ${JSON.stringify(group, null, 2)}`);
        
        expect(group).to.not.be.null; this.logger.info("  ✓ Expect group is not null => PASSED");
        expect(group.id).to.equal(this.groupId); this.logger.info(`  ✓ Expect group.id to equal ${this.groupId} => PASSED`);
        expect(group.name).to.not.be.empty; this.logger.info("  ✓ Expect group.name is not empty => PASSED");
        this.logger.info("✓ test__when_getGroup_is_called__then_group_is_returned: PASSED");
    }

    async test__when_getEvents_is_called__then_events_are_returned() {
        this.logger.info("Running test: test__when_getEvents_is_called__then_events_are_returned");
         if (!this.spond || !this.groupId) throw new Error("Not initialized");
         this.logger.info("Upcoming events:");
         const events = await this.spond.getEvents(this.groupId, null, false, false, null, new Date());
         this.logger.debug(`Events: ${JSON.stringify(events, null, 2)}`);
         
         expect(events).to.be.an('array'); this.logger.info("  ✓ Expect events to be an array => PASSED");
         // We can't guarantee events exist, but if they do, verify structure
         if (events && events.length > 0) {
             expect(events[0]).to.have.property('id'); this.logger.info("  ✓ Expect event to have property 'id' => PASSED");
             expect(events[0]).to.have.property('heading'); this.logger.info("  ✓ Expect event to have property 'heading' => PASSED");
         }
         this.logger.info("✓ test__when_getEvents_is_called__then_events_are_returned: PASSED");
    }

    async test__when_getEvent_is_called__then_attendees_are_retrieved() {
        this.logger.info("Running test: test__when_getEvent_is_called__then_attendees_are_retrieved");
        if (!this.spond || !this.eventId) throw new Error("Not initialized");
        
        this.logger.info(`Getting attendees for event ${this.eventId}...`);
        const event = await this.spond.getEvent(this.eventId);
        
        expect(event).to.not.be.null; this.logger.info("  ✓ Expect event is not null => PASSED");
        expect(event.id).to.equal(this.eventId); this.logger.info(`  ✓ Expect event.id to equal ${this.eventId} => PASSED`);
        
        if (event && event.responses && event.responses.acceptedIds && event.responses.acceptedIds.length > 0) {
            this.logger.debug("Attendees:");
            for (const memberId of event.responses.acceptedIds) {
                try {
                    const member = await this.spond.getPerson(memberId);
                    this.logger.debug(`- ${member.firstName} ${member.lastName}: ${member.email}`);
                    expect(member).to.have.property('id', memberId); this.logger.info(`  ✓ Expect member ${member.firstName} ${member.lastName} to have correct ID => PASSED`);
                } catch (e) {
                    this.logger.warn(`- Unknown member (ID: ${memberId})`);
                }
            }
        } else {
            this.logger.info("No attendees found.");
        }
        this.logger.info("✓ test__when_getEvent_is_called__then_attendees_are_retrieved: PASSED");
    }

    async runAll() {
        try {
            await this.setup();
            await this.test__when_getGroup_is_called__then_group_is_returned();
            await this.test__when_getEvents_is_called__then_events_are_returned();
            await this.test__when_getEvent_is_called__then_attendees_are_retrieved();
            this.logger.info("All tests completed successfully.");
        } catch (e: any) {
             this.logger.error(`Test execution failed: ${e.message}`);
             if (e.stack) this.logger.error(e.stack);
        }
    }
}
