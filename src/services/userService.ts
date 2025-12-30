import { GetUserDTO } from "../types/auth";
import { User } from "../data/problems";

export async function fetchUser(token: string, userDto: GetUserDTO): Promise<User> {
  const response = await fetch("http://localhost:5052/api/user/getUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userDto),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch user");
  }

  const result = await response.json();
  if(result.flag === false) throw new Error(result.message || "Failed to fetch user");

  return result.user;
}
