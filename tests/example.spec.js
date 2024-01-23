import { test, expect } from '@playwright/test';

test.describe.parallel("Domain API testing", ()=>{
  const baseURL = "http://localhost:3000";
  test("Should return the domain record of domain", async ({ request })=>{
    const res = await request.get(`${baseURL}/api/dns2/getDomainData/duplicate5.com`);
    const responseData = await res.json();
    expect(res.ok()).toBeTruthy();
    // console.log(responseData.domain);
    expect(responseData.domain).toBe("duplicate5.com");
  });

  test("Should add the domain record", async ({ request })=>{
    const res = await request.post(`${baseURL}/api/dns2/setDomainData`, {data: {
        "domain": "duplicate7.com",
        "ip": "157.240.242.35"
    }});

    const responseData = await res.json();
    expect(res.ok()).toBeTruthy();
    expect(responseData.message).toBe("Domain data saved");

  });

  test("Should return invalid data if same domain entered", async ({ request })=>{
    const res = await request.post(`${baseURL}/api/dns2/setDomainData`, {data: {
        "domain": "duplicate5.com",
        "ip": "157.240.242.35"
    }});

    const responseData = await res.json();
    expect(res.status()).toBe(400);
    expect(responseData.message).toBe("Domain already exist.");

  });

  test("Should update the ip if domain provided", async ({ request })=>{
    const res = await request.patch(`${baseURL}/api/dns2/updateDomainData`, {data: {
      "domain": "duplicate5.com",
      "ip": "157.240.242.38"
    }});

    const responseData = await res.json();
    expect(res.status()).toBe(201);
    expect(responseData.message).toBe("Domain updated successfully.");

  });

  test("Should not update if domain not found", async ({ request })=>{
    const res = await request.patch(`${baseURL}/api/dns2/updateDomainData`, {data: {
      "domain": "duplicate.com",
      "ip": "157.240.242.38"
    }});

    const responseData = await res.json();
    expect(res.status()).toBe(404);
    expect(responseData.message).toBe("Domain not found");

  });

  test("Should delete the if domain provided", async ({ request })=>{
    const res = await request.delete(`${baseURL}/api/dns2/deleteDomainData/duplicate5.com`);

    const responseData = await res.json();
    expect(res.status()).toBe(200);
    expect(responseData.message).toBe("Domain deleted.");

  });
})

