import resolver  from "./resolver.js";
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from "url";
import { gql } from "apollo-server-express";

const __dirname = dirname(fileURLToPath(import.meta.url))
const typeDef = readFileSync(join(__dirname, 'schema.gql'), 'utf-8')

export default {
    typeDef: gql`${typeDef}`,
    resolver
}