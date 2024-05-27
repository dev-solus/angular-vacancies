/**
 * Bank API
 * This API exposes endpoints to manage Bank operations
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { Account } from './account';


export interface Operation { 
    id?: number;
    operationType?: string;
    description?: string;
    amount?: number;
    date?: string;
    accountDebit?: Account;
    accountCredit?: Account;
    accountDebit_id?: number;
    accountCredit_id?: number;
}

