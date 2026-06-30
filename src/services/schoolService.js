const schools = [
  {
    schoolId: "SCH001",
    schoolName: "High School",
    registrationNumber: "REG12345",
    joiningDate: "2026-06-24",
    subscriptionPeriod: "1 Year",
    price: "Rs. 25,000",
    endDate: "2027-06-24",
    status: "Active",
  },
];

export function getSchools() {
  return schools;
}

export async function createSchool(data) {
  console.log(data);

  return {
    success: true,
    data,
  };
}