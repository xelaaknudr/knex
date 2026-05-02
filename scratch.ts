import { SelectQueryBuilder } from 'typeorm';

const methods = Object.getOwnPropertyNames(SelectQueryBuilder.prototype);
console.log('rightJoin', methods.includes('rightJoin'));
console.log('rightJoinAndSelect', methods.includes('rightJoinAndSelect'));
console.log('fullJoin', methods.includes('fullJoin'));
console.log('fullOuterJoin', methods.includes('fullOuterJoin'));
console.log('crossJoin', methods.includes('crossJoin'));

