import assert from 'assert';
import { TestHelpers, OracleCoordinator_OracleAdded } from 'generated';
const { MockDb, OracleCoordinator } = TestHelpers;

describe('OracleCoordinator contract OracleAdded event tests', () => {
	// Create mock db
	const mockDb = MockDb.createMockDb();

	// Creating mock for OracleCoordinator contract OracleAdded event
	const event = OracleCoordinator.OracleAdded.createMockEvent({
		/* It mocks event fields with default values. You can overwrite them if you need */
	});

	it('OracleCoordinator_OracleAdded is created correctly', async () => {
		// Processing the event
		const mockDbUpdated = await OracleCoordinator.OracleAdded.processEvent({
			event,
			mockDb,
		});

		// Getting the actual entity from the mock database
		let actualOracleCoordinatorOracleAdded =
			mockDbUpdated.entities.OracleCoordinator_OracleAdded.get(
				`${event.chainId}_${event.block.number}_${event.logIndex}`
			);

		// Creating the expected entity
		const expectedOracleCoordinatorOracleAdded: OracleCoordinator_OracleAdded = {
			id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
			transmitter: event.params.transmitter,
		};
		// Asserting that the entity in the mock database is the same as the expected entity
		assert.deepEqual(
			actualOracleCoordinatorOracleAdded,
			expectedOracleCoordinatorOracleAdded,
			'Actual OracleCoordinatorOracleAdded should be the same as the expectedOracleCoordinatorOracleAdded'
		);
	});
});
