import "@logion/node-api/dist/interfaces/types-lookup";
import { PolkadotService } from '@logion/rest-api-core';
import { PalletLoAuthorityListLegalOfficerData } from "@polkadot/types/lookup";
import { injectable } from 'inversify';

import { LegalOfficerAggregateRoot, LegalOfficerDescription, LegalOfficerRepository } from "../model/legalofficer.model";

@injectable()
export class LegalOfficerDataMergeService {

    constructor(
        private legalOfficerRepository: LegalOfficerRepository,
        private polkadotService: PolkadotService,
    ) {}

    async getAllLegalOfficers(): Promise<LegalOfficerDescription[]> {
        const dbLegalOfficers = await this.legalOfficerRepository.findAll();
        const dbLegalOfficersMap: Record<string, LegalOfficerAggregateRoot> = {};
        dbLegalOfficers.forEach(description => dbLegalOfficersMap[description.address!] = description);

        const api = await this.polkadotService.readyApi();
        const chainLegalOfficersMap: Record<string, PalletLoAuthorityListLegalOfficerData> = {};
        const chainLegalOfficers = await api.query.loAuthorityList.legalOfficerSet.entries();
        chainLegalOfficers.forEach(entry => {
            const address = (entry[0].toHuman() as string[])[0];
            const data = entry[1];
            if(data.isSome) {
                chainLegalOfficersMap[address] = data.unwrap();
            }
        });

        const fullList: LegalOfficerDescription[] = [];
        for(const address of Object.keys(chainLegalOfficersMap)) {
            if(address in dbLegalOfficersMap) {
                fullList.push(this.mergeDbChainData({
                    address,
                    chainData: chainLegalOfficersMap[address],
                    dbData: dbLegalOfficersMap[address],
                }));
            }
        }

        fullList.sort((lo1, lo2) => lo1.userIdentity.lastName.localeCompare(lo2.userIdentity.lastName));
        return fullList;
    }

    private mergeDbChainData(args: {
        address: string,
        dbData: LegalOfficerAggregateRoot | null,
        chainData: PalletLoAuthorityListLegalOfficerData,
    }): LegalOfficerDescription {
        const { address, dbData, chainData } = args;
        let description: LegalOfficerDescription;
        if(dbData) {
            description = dbData.getDescription();
        } else {
            description = this.emptyLegalOfficer(address);
        }

        if(chainData && chainData.baseUrl.isSome) {
            description = {
                ...description,
                node: chainData.baseUrl.unwrap().toUtf8(),
            }
        }

        return description;
    }

    private emptyLegalOfficer(address: string): LegalOfficerDescription {
        return {
            address,
            userIdentity: {
                firstName: "",
                lastName: "",
                email: "",
                phoneNumber: "",
            },
            postalAddress: {
                company: "",
                line1: "",
                line2: "",
                postalCode: "",
                city: "",
                country: "",
            },
            additionalDetails: "",
            node: "",
            logoUrl: "",
        };
    }

    async getLegalOfficer(address: string): Promise<LegalOfficerDescription> {
        const api = await this.polkadotService.readyApi();
        const chainLegalOfficer = await api.query.loAuthorityList.legalOfficerSet(address);
        if(chainLegalOfficer.isSome) {
            const dbLegalOfficer = await this.legalOfficerRepository.findByAddress(address);
            return this.mergeDbChainData({
                address,
                chainData: chainLegalOfficer.unwrap(),
                dbData: dbLegalOfficer,
            })
        } else {
            throw new Error("No legal officer with given address");
        }
    }
}
