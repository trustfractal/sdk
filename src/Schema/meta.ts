export const Metaschema = {
  $id: "https://json-schema.org/draft/2020-12/schema",
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    properties: {
      type: "object",
      patternProperties: {
        "^.*$": {
          type: "object",
          properties: {
            type: {
              oneOf: [
                {
                  type: "string",
                  enum: [
                    "string",
                    "integer",
                    "number",
                    "boolean",
                    "object",
                    "null",
                  ],
                },
                {
                  type: "array",
                  items: {
                    type: "string",
                    enum: [
                      "string",
                      "integer",
                      "number",
                      "boolean",
                      "object",
                      "null",
                    ],
                  },
                },
              ],
            },
          },
          additionalProperties: false,
          required: ["type"],
        },
      },
    },
    required: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
  additionalProperties: false,
  required: ["properties"],
};
