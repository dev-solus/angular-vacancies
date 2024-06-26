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
import { User } from './user';


export interface Account { 
    id?: number;
    accountNumber?: string;
    balance?: number;
    user?: User;
    status?: string;
    user_id?: number;
}

