/**
 * vacancy ANCFCC
 * API documentation
 *
 * The version of the OpenAPI document: v1
 * Contact: abdellah.elbekkali@digitransform.co
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { Role } from './role';


export interface User { 
    id?: number;
    firstname?: string | null;
    lastname?: string | null;
    avatar?: string | null;
    email?: string | null;
    creationDate?: string | null;
    active?: boolean;
    password?: string | null;
    phone?: string | null;
    roleId?: number;
    role?: Role;
}

