import {
  isHonorific,
  isInitial,
  parseContactName,
  airtableRecordToMailchimp,
} from '../lib/airtable-contacts.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(isHonorific('Mrs'));
assert(isHonorific('Dr.'));
assert(!isHonorific('Anna'));

assert(isInitial('C'));
assert(isInitial('J.'));
assert(!isInitial('Anna'));

const mrsAnna = parseContactName('Mrs Anna C Lyon');
assert(mrsAnna.firstName === 'Anna', `expected Anna, got ${mrsAnna.firstName}`);
assert(mrsAnna.lastName === 'C Lyon', `expected C Lyon, got ${mrsAnna.lastName}`);

const john = parseContactName('John A Smith');
assert(john.firstName === 'John');
assert(john.lastName === 'A Smith');

const salutation = parseContactName('Robert Smith', 'Bob');
assert(salutation.firstName === 'Bob');
assert(salutation.lastName === 'Robert Smith');

const badSalutation = parseContactName('Anna Lyon', 'Mrs');
assert(badSalutation.firstName === 'Anna');
assert(badSalutation.lastName === 'Lyon');

const merge = airtableRecordToMailchimp({ 'Full name': 'Mrs Anna C Lyon' });
assert(merge.FNAME === 'Anna');
assert(merge.LNAME === 'C Lyon');

const lowercase = airtableRecordToMailchimp({ 'Full name': 'glynis francis' });
assert(lowercase.FNAME === 'Glynis');
assert(lowercase.LNAME === 'Francis');

const uppercase = airtableRecordToMailchimp({ 'Full name': 'MICHAEL JAMES FRANKLIN' });
assert(uppercase.FNAME === 'Michael');
assert(uppercase.LNAME === 'James Franklin');

const teddy = airtableRecordToMailchimp({ 'Full name': 'Teddy Cooksey' });
assert(teddy.FNAME === 'Teddy');
assert(teddy.LNAME === 'Cooksey');

const mixedCase = airtableRecordToMailchimp({ 'Full name': 'Mark McMullen' });
assert(mixedCase.FNAME === 'Mark');
assert(mixedCase.LNAME === 'McMullen');

const hyphenated = airtableRecordToMailchimp({ 'Full name': 'Owen Sedgwick-Jell' });
assert(hyphenated.FNAME === 'Owen');
assert(hyphenated.LNAME === 'Sedgwick-Jell');

console.log('parse-contact-name tests passed');
