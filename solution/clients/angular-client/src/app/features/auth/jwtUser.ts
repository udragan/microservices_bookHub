import { JwtPayload } from "jwt-decode";

export interface JwtUser extends JwtPayload {
	role: string;
}
