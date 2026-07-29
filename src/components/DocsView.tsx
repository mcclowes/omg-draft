'use client';

import type { OasDoc, OasParameter, OasResponse, OasSchema } from '@/lib/oas';
import { groupByTag, resolveSchema, schemaConstraints, schemaLabel, type OperationEntry } from '@/lib/oas-view';
import styles from './DocsView.module.scss';

const MAX_DEPTH = 6;

export function DocsView({ doc }: { doc: OasDoc }) {
  const groups = groupByTag(doc);
  const schemas = Object.entries(doc.components?.schemas ?? {});

  return (
    <article className={styles.docs}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1>{doc.info.title}</h1>
          <span className={styles.version}>v{doc.info.version}</span>
        </div>
        <div className={styles.specMeta}>
          <span>OpenAPI {doc.openapi}</span>
          {doc.servers?.map((server) => (
            <code key={server.url}>{server.url}</code>
          ))}
        </div>
        {doc.info.description && <p className={styles.description}>{doc.info.description}</p>}
      </header>

      {groups.length === 0 && (
        <p className={styles.noOps}>No endpoints yet — add an endpoint file with a method and path.</p>
      )}

      {groups.map((group) => (
        <section key={group.tag} className={styles.tagSection}>
          <div className={styles.tagHeading}>
            <h2>{group.tag}</h2>
            <span className={styles.rule} />
          </div>
          {group.description && <p className={styles.tagDescription}>{group.description}</p>}
          {group.operations.map((entry) => (
            <OperationCard key={`${entry.method} ${entry.path}`} doc={doc} entry={entry} />
          ))}
        </section>
      ))}

      {schemas.length > 0 && (
        <section className={styles.tagSection}>
          <div className={styles.tagHeading}>
            <h2>Schemas</h2>
            <span className={styles.rule} />
          </div>
          {schemas.map(([name, schema]) => (
            <div key={name} className={styles.schemaCard}>
              <div className={styles.schemaCardName}>
                <code>{name}</code>
                <span className={styles.typeLabel}>{schemaLabel(schema)}</span>
              </div>
              <SchemaTree doc={doc} schema={schema} depth={0} />
            </div>
          ))}
        </section>
      )}
    </article>
  );
}

function OperationCard({ doc, entry }: { doc: OasDoc; entry: OperationEntry }) {
  const { method, path, operation } = entry;
  const responses = Object.entries(operation.responses ?? {});

  return (
    <div className={styles.operation} data-deprecated={operation.deprecated || undefined}>
      <div className={styles.opHeader}>
        <span className={styles.method} data-method={method}>
          {method.toUpperCase()}
        </span>
        <code className={styles.path}>{formatPath(path)}</code>
        {operation.deprecated && <span className={styles.deprecated}>deprecated</span>}
      </div>

      {operation.summary && <h3 className={styles.summary}>{operation.summary}</h3>}
      {operation.description && <p className={styles.opDescription}>{operation.description}</p>}

      {operation.parameters && operation.parameters.length > 0 && (
        <OpSection label="Parameters">
          <div className={styles.paramList}>
            {operation.parameters.map((param) => (
              <ParameterRow key={`${param.in}:${param.name}`} doc={doc} param={param} />
            ))}
          </div>
        </OpSection>
      )}

      {operation.requestBody?.content && (
        <OpSection label="Request body">
          {Object.entries(operation.requestBody.content).map(([mediaType, media]) => (
            <div key={mediaType}>
              <code className={styles.mediaType}>{mediaType}</code>
              {media.schema && <SchemaTree doc={doc} schema={media.schema} depth={0} />}
            </div>
          ))}
        </OpSection>
      )}

      {responses.length > 0 && (
        <OpSection label="Responses">
          {responses.map(([status, response]) => (
            <ResponseRow key={status} doc={doc} status={status} response={response} />
          ))}
        </OpSection>
      )}
    </div>
  );
}

function OpSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.opSection}>
      <span className={styles.opSectionLabel}>{label}</span>
      {children}
    </div>
  );
}

function ParameterRow({ doc, param }: { doc: OasDoc; param: OasParameter }) {
  const schema = param.schema ?? {};
  const constraints = schemaConstraints(schema);

  return (
    <div className={styles.paramRow}>
      <div className={styles.paramName}>
        <code>{param.name}</code>
        <span className={styles.paramIn}>{param.in}</span>
        {param.required && <span className={styles.required}>required</span>}
      </div>
      <div className={styles.paramDetail}>
        <span className={styles.typeLabel}>{schemaLabel(schema)}</span>
        {param.description && <span className={styles.fieldDescription}>{param.description}</span>}
        {constraints.length > 0 && (
          <span className={styles.constraints}>{constraints.join(' · ')}</span>
        )}
      </div>
      <NestedSchema doc={doc} schema={schema} depth={1} />
    </div>
  );
}

function ResponseRow({ doc, status, response }: { doc: OasDoc; status: string; response: OasResponse }) {
  const statusClass = status === 'default' ? 'default' : status[0];

  return (
    <div className={styles.responseRow}>
      <div className={styles.responseHead}>
        <span className={styles.statusCode} data-status={statusClass}>
          {status}
        </span>
        {response.description && <span className={styles.responseDescription}>{response.description}</span>}
      </div>
      {Object.entries(response.content ?? {}).map(([mediaType, media]) =>
        media.schema ? <SchemaTree key={mediaType} doc={doc} schema={media.schema} depth={0} /> : null
      )}
    </div>
  );
}

function SchemaTree({ doc, schema, depth }: { doc: OasDoc; schema: OasSchema; depth: number }) {
  if (depth > MAX_DEPTH) return <span className={styles.typeLabel}>…</span>;

  const { schema: resolved, refName } = resolveSchema(doc, schema);

  // Arrays of objects render their item's shape.
  if (resolved.type === 'array' && resolved.items) {
    const { schema: item, refName: itemRef } = resolveSchema(doc, resolved.items);
    if (item.properties) {
      return (
        <div className={styles.schemaTree}>
          <span className={styles.arrayNote}>
            array of {itemRef ?? 'object'}
          </span>
          <ObjectProperties doc={doc} schema={item} depth={depth} />
        </div>
      );
    }
    return <span className={styles.typeLabel}>{schemaLabel(resolved)}</span>;
  }

  if (resolved.properties) {
    return (
      <div className={styles.schemaTree}>
        {refName && <span className={styles.refChip}>{refName}</span>}
        <ObjectProperties doc={doc} schema={resolved} depth={depth} />
      </div>
    );
  }

  const variants = resolved.oneOf ?? resolved.anyOf;
  if (variants) {
    return (
      <div className={styles.schemaTree}>
        {variants.map((variant, i) => (
          <div key={i} className={styles.variant}>
            <span className={styles.variantLabel}>{i === 0 ? 'one of' : 'or'}</span>
            <SchemaTree doc={doc} schema={variant} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  return <span className={styles.typeLabel}>{schemaLabel(resolved)}</span>;
}

function ObjectProperties({ doc, schema, depth }: { doc: OasDoc; schema: OasSchema; depth: number }) {
  const required = new Set(schema.required ?? []);

  return (
    <div className={styles.properties}>
      {Object.entries(schema.properties ?? {}).map(([name, prop]) => {
        const constraints = schemaConstraints(prop);
        return (
          <div key={name} className={styles.propertyRow}>
            <div className={styles.propertyHead}>
              <code className={styles.propertyName}>{name}</code>
              <span className={styles.typeLabel}>{schemaLabel(prop)}</span>
              {required.has(name) && <span className={styles.required}>required</span>}
              {prop.deprecated && <span className={styles.deprecated}>deprecated</span>}
            </div>
            {prop.description && <span className={styles.fieldDescription}>{prop.description}</span>}
            {constraints.length > 0 && (
              <span className={styles.constraints}>{constraints.join(' · ')}</span>
            )}
            <NestedSchema doc={doc} schema={prop} depth={depth + 1} />
          </div>
        );
      })}
    </div>
  );
}

// Renders nested structure beneath a property row when it's an object/array-of-object/ref.
function NestedSchema({ doc, schema, depth }: { doc: OasDoc; schema: OasSchema; depth: number }) {
  if (depth > MAX_DEPTH) return null;

  const { schema: resolved } = resolveSchema(doc, schema);
  const item = resolved.type === 'array' && resolved.items ? resolveSchema(doc, resolved.items).schema : null;

  if (item?.properties) {
    return <ObjectProperties doc={doc} schema={item} depth={depth} />;
  }
  if (resolved.properties && resolved !== schema) {
    // Refs to object types expand inline; inline objects are handled by their own tree.
    return <ObjectProperties doc={doc} schema={resolved} depth={depth} />;
  }
  if (schema.properties) {
    return <ObjectProperties doc={doc} schema={schema} depth={depth} />;
  }
  return null;
}

function formatPath(path: string): React.ReactNode {
  return path.split(/(\{[^}]+\})/).map((part, i) =>
    part.startsWith('{') ? (
      <em key={i} className={styles.pathParam}>
        {part}
      </em>
    ) : (
      part
    )
  );
}
