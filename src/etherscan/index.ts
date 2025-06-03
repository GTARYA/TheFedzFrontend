import axios from "axios";
import { getAddress } from "ethers/lib/utils";

export const ETHERSCAN_API_KEY = '6N6Q2DRTUHGIVZ462FXWCX8AW7JPJTZBQ3';
export const ETHERSCAN_API_URL = 'https://api.arbiscan.io/api';



type TopicOperator = 'and' | 'or';

interface LogsQuery {
    address: string;
    fromBlock: number;
    toBlock?: number | 'latest';
    topic0: string;
    topic1?: string;
    topic2?: string;
    topic3?: string;
    page?: number;
    offset?: number;
    topic1_2_opr?: TopicOperator;
    topic2_3_opr?: TopicOperator;
    topic1_3_opr?: TopicOperator;
}

const DEFAULT_OFFSET = 1000;
export const getLogs = async (query: LogsQuery, base?: string, apiKey?: string) => {
    let urlQuery = `module=logs&action=getLogs&address=${query.address}&apikey=${apiKey || ETHERSCAN_API_KEY}&offset=${query.offset || DEFAULT_OFFSET}&page=${query.page || 1}`;
    urlQuery += `&topic0=${query.topic0}`;
    if (query.topic1) {
        urlQuery += `&topic1=${query.topic1}`;
    }
    if (query.topic2) {
        urlQuery += `&topic2=${query.topic2}`;
    }
    if (query.topic3) {
        urlQuery += `&topic3=${query.topic3}`;
    }
    if (query.topic1_2_opr) {
        urlQuery += `&topic1_2_opr=${query.topic1_2_opr}`;
    }
    if (query.topic2_3_opr) {
        urlQuery += `&topic2_3_opr=${query.topic2_3_opr}`;
    }
    if (query.topic1_3_opr) {
        urlQuery += `&topic1_3_opr=${query.topic1_3_opr}`;
    }
    if (query.fromBlock) {
        urlQuery += `&fromBlock=${query.fromBlock}`;
    }
    if (query.toBlock) {
        urlQuery += `&toBlock=${query.toBlock}`;
    }

    const URL = `${base || ETHERSCAN_API_URL}?${urlQuery}`;
    console.log("URL", URL);
    const response = await axios.get(
        URL
    );
    const records = response.data.result?.map((record: any) => {
    return {
        address: getAddress(record.address),
        topic0: record.topics[0],
        topic1: record.topics[1],
        topic2: record.topics[2],
        topic3: record.topics[3],
        data: record.data,
        blockNumber: parseInt(record.blockNumber, 16),
        transactionHash: record.transactionHash,
        transactionIndex: parseInt(record.transactionIndex, 16) || 0,
        logIndex: parseInt(record.logIndex, 16) || 0,
        timestamp: new Date(parseInt(record.timeStamp, 16) * 1000).toISOString(),
        gasUsed: BigInt(record.gasUsed) || 0,
        gasPrice: BigInt(record.gasPrice === '0x' ? '0x0' : record.gasPrice) || 0,
    }
    });
    return records;
};