// import cbor from 'cbor';

// const data = Buffer.from(
//   '0x6c636f64654c6f636174696f6ec258200000000000000000000000000000000000000000000000000000000000000000686c616e6775616765c25820000000000000000000000000000000000000000000000000000000000000000066736f757263656331323364617267739f646e616d6566766564616e7463616765623231ff'.slice(
//     2
//   ),
//   'hex'
// );

// const decoded = await cbor.decodeAll(data);
// console.log(decoded);

// /**
//  * [
//   'codeLocation',
//   0n,
//   'language',
//   0n,
//   'source',
//   '123',
//   'args',
//   [ 'name', 'vedant', 'age', '21' ]
// ]
//  */

// // convert to object {codeLocation: 0, language: 0, source: '123', args: {name: 'vedant', age: '21'}}

// const parseJson = (data, obj) => {
//   data.forEach((value, index) => {
//     if (index % 2 === 0) {
//       if (!Array.isArray(data[index + 1])) obj[value] = data[index + 1];
//       else obj[value] = parseJson(data[index + 1], {});
//     }
//   });

//   return obj;
// };

// console.log(parseJson(decoded, {}));
