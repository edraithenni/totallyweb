

import logger from "./logger";

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ status: "ok" }),
  })
);

describe("Frontend Logger", () => {
  beforeEach(() => {
    fetch.mockClear();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  test("logger.info logs message and sends request", async () => {
    logger.info("Test info");

    expect(console.info).toHaveBeenCalledWith("[INFO]", "Test info", "");
    expect(fetch).toHaveBeenCalled();
  });

  test("logger.warn logs message and sends request", async () => {
    logger.warn("Test warning");

    expect(console.warn).toHaveBeenCalledWith("[WARN]", "Test warning", "");
    expect(fetch).toHaveBeenCalled();
  });

  test("logger.error logs message and sends request", async () => {
    logger.error("Test error");

    expect(console.error).toHaveBeenCalledWith("[ERROR]", "Test error", "");
    expect(fetch).toHaveBeenCalled();
  });

  test("logger sends correct JSON body", async () => {
    logger.info("Submit review", { id: 1 });

    const body = JSON.parse(fetch.mock.calls[0][1].body);

    expect(body.level).toBe("info");
    expect(body.message).toBe("Submit review");
    expect(body.data).toEqual({ id: 1 });
    expect(body.timestamp).toBeDefined();
  });
});
