import axios from "axios";
import { baseURL } from '../env.js'


export const api = axios.create({
  baseURL: baseURL
})