import "jasmine";
import {
  deepSortObject,
  deepSortArray,
  normaliseObject,
} from "../../../src/utils";

describe("deepSortObject", () => {
  it("sorts equivalent objects", () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { b: 2, a: 1 };

    const sorted1 = deepSortObject(obj1);
    const sorted2 = deepSortObject(obj2);

    const str1 = JSON.stringify(sorted1);
    const str2 = JSON.stringify(sorted2);
    expect(str1).toEqual(str2);
  });

  it("sorts nested objects", () => {
    const input = {
      last: [{ b: 2, a: 1 }, 1, "z"],
      first: { z: 9, a: 1 },
    };

    const output = JSON.stringify({
      first: { a: 1, z: 9 },
      last: ["z", 1, { a: 1, b: 2 }],
    });

    const sorted = deepSortObject(input);

    const str = JSON.stringify(sorted);
    expect(str).toEqual(output);
  });
});

describe("deepSortArray", () => {
  it("sorts equivalent arrays", () => {
    const obj1 = [10, 9, "a"];
    const obj2 = ["a", 10, 9];

    const sorted1 = deepSortArray(obj1);
    const sorted2 = deepSortArray(obj2);

    const str1 = JSON.stringify(sorted1);
    const str2 = JSON.stringify(sorted2);
    expect(str1).toEqual(str2);
  });

  it("sorts nested objects", () => {
    const input = [
      "10",
      10,
      9,
      "a",
      { last: { b: 2, a: 1 }, first: [3, 2, 1] },
      ["a", "c", "b"],
    ];

    const output = JSON.stringify([
      "10",
      "a",
      10,
      9,
      ["a", "b", "c"],
      { first: [1, 2, 3], last: { a: 1, b: 2 } },
    ]);

    const sorted = deepSortArray(input);

    const str = JSON.stringify(sorted);
    expect(str).toEqual(output);
  });
});

describe("normaliseObject", () => {
  it("normalise an object to a flat array of objects", () => {
    const obj = {
      first_name: "Foo",
      last_name: "Bar",
      age: 20,
      address: {
        street: "Tinsel Street",
        city: "Metropolis",
      },
    };

    const output = [
      '{"first_name":"Foo"}',
      '{"last_name":"Bar"}',
      '{"age":20}',
      '{"address":{"street":"Tinsel Street","city":"Metropolis"}}',
    ];

    const response = normaliseObject(obj);

    expect(response).toEqual(output);
  });
});
