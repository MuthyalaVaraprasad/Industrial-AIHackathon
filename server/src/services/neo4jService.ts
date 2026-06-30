import neo4j, { type Driver } from 'neo4j-driver';
import { env, services } from '../config/env';
import { graphData as mockGraphData } from '../data/mockData';

let driver: Driver | null = null;

export async function connectNeo4j(): Promise<boolean> {
  if (!services.neo4j) {
    console.log('[Neo4j] Not configured — using mock graph data');
    return false;
  }

  try {
    driver = neo4j.driver(env.neo4jUri, neo4j.auth.basic(env.neo4jUser, env.neo4jPassword));
    await driver.verifyConnectivity();
    console.log('[Neo4j] Connected');
    await seedGraphIfEmpty();
    return true;
  } catch (err) {
    driver = null;
    services.neo4j = false;
    console.warn('[Neo4j] Connection failed — using mock data:', (err as Error).message);
    return false;
  }
}

async function seedGraphIfEmpty(): Promise<void> {
  if (!driver) return;
  const session = driver.session();
  try {
    const result = await session.run('MATCH (n) RETURN count(n) AS count');
    const count = result.records[0]?.get('count')?.toNumber?.() ?? 0;
    if (count > 0) return;

    for (const node of mockGraphData.nodes) {
      await session.run(
        `MERGE (n:Node {id: $id}) SET n.label = $label, n.type = $type, n.data = $data`,
        { id: node.id, label: node.label, type: node.type, data: JSON.stringify(node.data || {}) }
      );
    }
    for (const edge of mockGraphData.edges) {
      await session.run(
        `MATCH (a:Node {id: $source}), (b:Node {id: $target})
         MERGE (a)-[r:RELATED {id: $id}]->(b) SET r.label = $label`,
        { id: edge.id, source: edge.source, target: edge.target, label: edge.label || '' }
      );
    }
    console.log('[Neo4j] Seeded knowledge graph');
  } finally {
    await session.close();
  }
}

export async function getKnowledgeGraph(search?: string, type?: string) {
  if (!driver || !services.neo4j) return mockGraphData;

  const session = driver.session();
  try {
    let nodeQuery = 'MATCH (n:Node)';
    const params: Record<string, string> = {};

    if (search) {
      nodeQuery += ' WHERE toLower(n.label) CONTAINS toLower($search)';
      params.search = search;
    }
    if (type && type !== 'all') {
      nodeQuery += search ? ' AND n.type = $type' : ' WHERE n.type = $type';
      params.type = type;
    }
    nodeQuery += ' RETURN n';

    const nodeResult = await session.run(nodeQuery, params);
    const nodes = nodeResult.records.map((r) => {
      const n = r.get('n').properties;
      return {
        id: n.id as string,
        label: n.label as string,
        type: n.type as string,
        data: n.data ? JSON.parse(n.data as string) : {},
      };
    });

    const nodeIds = nodes.map((n) => n.id);
    if (nodeIds.length === 0) return mockGraphData;

    const edgeResult = await session.run(
      `MATCH (a:Node)-[r:RELATED]->(b:Node)
       WHERE a.id IN $ids AND b.id IN $ids
       RETURN r.id AS id, a.id AS source, b.id AS target, r.label AS label`,
      { ids: nodeIds }
    );

    const edges = edgeResult.records.map((r) => ({
      id: r.get('id') as string,
      source: r.get('source') as string,
      target: r.get('target') as string,
      label: r.get('label') as string,
    }));

    return { nodes, edges };
  } catch (err) {
    console.warn('[Neo4j] Query failed:', (err as Error).message);
    return mockGraphData;
  } finally {
    await session.close();
  }
}

export async function closeNeo4j(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

export function isNeo4jAvailable(): boolean {
  return services.neo4j && driver !== null;
}
