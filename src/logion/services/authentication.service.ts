import jwt, { Jwt, VerifyErrors } from "jsonwebtoken";
import { injectable } from "inversify";
import { Request } from "express";
import { UnauthorizedException } from "dinoloop/modules/builtin/exceptions/exceptions";
import { Moment } from "moment";

export interface AuthenticatedUser {
    address: string,
    legalOfficer: boolean;
}

export class LogionUserCheck implements AuthenticatedUser {
    constructor(
        logionUser: AuthenticatedUser,
    ) {
        this.address = logionUser.address;
        this.legalOfficer = logionUser.legalOfficer;
    }

    requireLegalOfficer(): void {
        this.require(user => user.legalOfficer, "Reserved to legal officer");
    }

    requireIs(address: string | undefined | null): void {
        this.require(user => user.is(address), "User has not access to this resource");
    }

    is(address: string | undefined | null): boolean {
        return address !== undefined
            && address !== null
            && address === this.address;
    }

    require(predicate: (check: LogionUserCheck) => boolean, message?: string): LogionUserCheck {
        if(!predicate(this)) {
            throw unauthorized(message || "Unauthorized");
        }
        return this;
    }

    isOneOf(addresses: (string | undefined | null)[]): boolean {
        return addresses.some(address => this.is(address));
    }

    readonly address: string;
    readonly legalOfficer: boolean;
}

export interface Token {
    value: string,
    expiredOn: Moment
}

export function unauthorized(error: string): UnauthorizedException<{ error: string }> {
    return new UnauthorizedException({ error: error });
}

@injectable()
export class AuthenticationService {

    authenticatedUser(request: Request): LogionUserCheck {
        const user = this.extractLogionUser(request);
        return new LogionUserCheck(user);
    }

    authenticatedUserIs(request: Request, address: string | undefined | null): LogionUserCheck {
        const user = this.authenticatedUser(request);
        if (user.is(address)) {
            return new LogionUserCheck(user);
        }
        throw unauthorized("User has not access to this resource");
    }

    authenticatedUserIsOneOf(request: Request, ...addresses: (string | undefined | null)[]): LogionUserCheck {
        const user = this.authenticatedUser(request);
        if (user.isOneOf(addresses)) {
            return new LogionUserCheck(user);
        }
        throw unauthorized("User has not access to this resource");
    }

    private extractLogionUser(request: Request): AuthenticatedUser {
        const jwtToken = this.extractBearerToken(request);
        jwt.verify(jwtToken, this.secret, { issuer: this.issuer }, err => {
            if (err) {
                throw this._unauthorized(err)
            }
        });
        const token = jwt.decode(jwtToken, { complete: true }) as Jwt;
        if(typeof token.payload !== 'string') {
            return {
                address: token.payload.sub!,
                legalOfficer: token.payload.legalOfficer
            }
        } else {
            throw unauthorized("Unable to decode payload");
        }
    }

    private extractBearerToken(request: Request): string {
        const header = request.header("Authorization");
        if (header === undefined || !header.startsWith("Bearer ")) {
            throw unauthorized("Invalid Authorization header");
        }
        return header.split(' ')[1].trim();
    }

    private readonly secret: Buffer;
    private readonly issuer: string;
    private readonly ttl: number;

    constructor() {
        if (process.env.JWT_SECRET === undefined) {
            throw Error("No JWT secret set, please set var JWT_SECRET");
        }
        if (process.env.JWT_ISSUER === undefined) {
            throw Error("No JWT issuer set, please set var JWT_ISSUER");
        }
        if (process.env.JWT_TTL_SEC === undefined) {
            throw Error("No JWT Time-to-live set, please set var JWT_TTL_SEC");
        }
        const bas64EncodedSecret = process.env.JWT_SECRET as string;
        this.secret = Buffer.from(bas64EncodedSecret, 'base64')
        this.issuer = process.env.JWT_ISSUER;
        this.ttl = parseInt(process.env.JWT_TTL_SEC);
    }

    private _unauthorized(error: VerifyErrors): UnauthorizedException<{ error: string }> {
        return new UnauthorizedException({ error: error.name + ": " + error.message });
    }
}