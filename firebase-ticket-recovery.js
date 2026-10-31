// Disabled safety stub.
// This file intentionally performs NO Firebase reads or writes.
// The previous recovery routine used setDoc(..., {merge:false}) against appState,
// which could replace canonical ticket state. Recovery must be done only from
// verified data sources and must never mutate status/timestamps automatically.
console.info('firebase-ticket-recovery.js disabled: no database mutation performed.');
