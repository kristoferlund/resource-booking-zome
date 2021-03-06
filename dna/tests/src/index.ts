import { Orchestrator, Config } from "@holochain/tryorama";

const sleep = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms));

const orchestrator = new Orchestrator();

export const simpleConfig = {
  alice: Config.dna("../bookings.dna.gz", null),
  bobbo: Config.dna("../bookings.dna.gz", null),
};

orchestrator.registerScenario("create and get a meeting room", async (s, t) => {
  const { conductor } = await s.players({
    conductor: Config.gen(simpleConfig),
  });
  await conductor.spawn();

  let hash = await conductor.call("alice", "resources", "create_meeting_room", {
    name: "Meeting room 1",
    description: "Some description",
  });
  t.ok(hash);

  await sleep(100);
  let meetingRooms = await conductor.call(
    "bobbo",
    "resources",
    "get_all_meeting_rooms",
    null
  );
  console.log(meetingRooms)
  t.equal(meetingRooms.length, 1);
});

const dateToTimestamp = (date) => [
  Math.floor(date / 1000),
  (date % 1000) * 1000,
];

orchestrator.registerScenario("create and get a meeting room", async (s, t) => {
  const { conductor } = await s.players({
    conductor: Config.gen(simpleConfig),
  });
  await conductor.spawn();

  let meetingRoomHash = await conductor.call(
    "alice",
    "resources",
    "create_meeting_room",
    {
      name: "Meeting room 1",
      description: "Some description",
    }
  );
  t.ok(meetingRoomHash);

  const startTime = dateToTimestamp(Date.now());
  const endTime = dateToTimestamp(Date.now() + 1000 * 60 * 60 * 2);

  let requestHash = await conductor.call(
    "alice",
    "bookings",
    "request_to_book_resource",
    {
      resource_hash: meetingRoomHash,
      start_time: startTime,
      end_time: endTime,
      event_title: "Important meeting",
    }
  );
  t.ok(requestHash);

  let bookingRequests = await conductor.call(
    "alice",
    "bookings",
    "get_booking_requests_for_resource",
    meetingRoomHash
  );
  t.equal(bookingRequests.length, 1);

  let bookingHash = await conductor.call(
    "alice",
    "bookings",
    "accept_booking_request",
    requestHash
  );
  t.ok(bookingHash);

  let bookings = await conductor.call(
    "alice",
    "bookings",
    "get_bookings_for_resource",
    meetingRoomHash
  );
  t.equal(bookings.length, 1);
});

orchestrator.run();
