import resolver from "./resolver.js";
import { join, dirname } from 'path'
import { readFileSync } from "fs"; 
import { fileURLToPath } from "url";
import { gql } from "apollo-server-express";

const __dirname = dirname(fileURLToPath(import.meta.url))
const schema = readFileSync(join(__dirname, 'schema.gql'), 'utf-8')

export default {
    typedef: gql`${schema}`,
    resolver
}