/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {}

export interface components {
  schemas: {
    /**
     * FetchLegalOfficersView
     * @description The fetched Legal Officers
     */
    FetchLegalOfficersView: {
      /** @description All the legal officers */
      legalOfficers?: components["schemas"]["LegalOfficerView"][];
    };
    LegalOfficerView: {
      /** @description The SS58 address of the legal officer */
      address?: string;
      /** @description The identification data of the legal officer */
      userIdentity?: components["schemas"]["UserIdentityView"];
      /** @description The postal address of the legal officer */
      postalAddress?: components["schemas"]["PostalAddressView"];
      /** @description Any additional public info */
      additionalDetails?: string;
      /**
       * @description The node base URL
       * @example https://node01.logion.network
       */
      node?: string;
      /**
       * @description The URL to a custom logo
       * @example https://www.logion.network/logo.png
       */
      logoUrl?: string;
      /**
       * @description The node ID
       * @example 12D3KooWBmAwcd4PJNJvfV89HwE48nwkRmAgo8Vy3uQEyNNHBox2
       */
      nodeId?: string;
    };
    CreateOrUpdateLegalOfficerView: {
      /** @description The identification data of the legal officer */
      userIdentity?: components["schemas"]["UserIdentityView"];
      /** @description The postal address of the legal officer */
      postalAddress?: components["schemas"]["PostalAddressView"];
      /** @description Any additional public info */
      additionalDetails?: string;
      /**
       * @description The node info
       * @example https://node01.logion.network
       */
      node?: string;
      /**
       * @description The URL to a custom logo
       * @example https://www.logion.network/logo.png
       */
      logoUrl?: string;
    };
    /**
     * UserIdentityView
     * @description Physical person identification data
     */
    UserIdentityView: {
      /** @description E-mail */
      email?: string;
      /** @description First name */
      firstName?: string;
      /** @description Last name */
      lastName?: string;
      /** @description Phone number */
      phoneNumber?: string;
    };
    /**
     * PostalAddressView
     * @description A postal address
     */
    PostalAddressView: {
      /** @description The company of the Legal Officer */
      company?: string;
      /** @description First address line */
      line1?: string;
      /** @description Second address line */
      line2?: string;
      /** @description Postal code */
      postalCode?: string;
      /** @description City */
      city?: string;
      /** @description Country */
      country?: string;
    };
  };
}

export interface operations {}

export interface external {}
