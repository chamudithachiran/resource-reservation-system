const API_URL = "http://localhost:3000/api/reservations";

// Replace with real IDs from your database.
const userId = "695c46d2-f452-48da-b4cc-ca2a9f524810";
const resourceId = "69eafb6d-5ac0-4250-bfcf-0fc4d7a2c122";

const startTime = "2027-01-15T11:00:00.000Z";
const endTime = "2027-01-15T10:00:00.000Z";

async function createReservation() {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      resourceId,
      startTime,
      endTime,
      purpose: "Concurrency test",
    }),
  });

  return {
    status: response.status,
    body: await response.json(),
  };
}

const results = await Promise.all([
  createReservation(),
  createReservation(),
]);

console.log(JSON.stringify(results, null, 2));

const successCount = results.filter(
  (result) => result.status === 201,
).length;

const conflictCount = results.filter(
  (result) => result.status === 409,
).length;

console.log({ successCount, conflictCount });

if (successCount === 1 && conflictCount === 1) {
  console.log("PASS: Concurrency protection works.");
} else {
  console.log("CHECK: Review the responses above.");
}