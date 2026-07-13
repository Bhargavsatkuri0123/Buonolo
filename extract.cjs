const fs = require('fs');
let code = fs.readFileSync('src/components/CommunityTab.tsx', 'utf8');

const userStart = code.indexOf('if (selectedUser) {');
const groupStart = code.indexOf('if (selectedGroup) {');
const eventStart = code.indexOf('if (selectedEvent) {');
const mainReturn = code.indexOf('return (', eventStart + 10);

const userCode = code.substring(userStart + 19, groupStart).trim();
const userReturnCode = userCode.substring(userCode.indexOf('return ('));
const userComponent = `export const UserView = ({ user, onClose, T, onGroupClick }: any) => {
  ${userReturnCode}
};\n\n`;

const eventCode = code.substring(eventStart + 20, mainReturn).trim();
const eventReturnCode = eventCode.substring(eventCode.indexOf('return ('));
const eventComponent = `export const EventView = ({ event: selectedEvent, onClose, T, onUserClick }: any) => {
  ${eventReturnCode}
};\n\n`;

const modifiedCode = code
  .replace(userCode, '')
  .replace('if (selectedUser) {', '')
  .replace(eventCode, '')
  .replace('if (selectedEvent) {', '');

// Replace specific variable references in the extracted components
const fixedUserComponent = userComponent
  .replace(/selectedUser/g, 'user')
  .replace(/setSelectedUser\(null\)/g, 'onClose()')
  .replace(/setSelectedGroup\((.*?)\)/g, 'onGroupClick($1)');

const fixedEventComponent = eventComponent
  .replace(/setSelectedEvent\(null\)/g, 'onClose()')
  .replace(/setSelectedUser\((.*?)\)/g, 'onUserClick($1)')

const finalCode = fixedUserComponent + fixedEventComponent + modifiedCode;

fs.writeFileSync('src/components/CommunityTab.tsx', finalCode);
