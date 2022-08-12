// node_fields
export enum V8SnapshotNodeFields {
    type = 'type',
    name = 'name',
    id = 'id',
    self_size = 'self_size',
    edge_count = 'edge_count',
    trace_node_id = 'trace_node_id',
    detachedness = 'detachedness'
}

// node_types
export enum V8SnapshotNodeTypes {
    hidden = 'hidden',
    array = 'array',
    string = 'string',
    object = 'object',
    code = 'code',
    closure = 'closure',
    regexp = 'regexp',
    number = 'number',
    native = 'native',
    synthetic = 'synthetic',
    concatenated_string = 'concatenated string',
    sliced_string = 'sliced string',
    symbol = 'symbol',
    bigint = 'bigint'
}

// edge_fields
export enum V8SnapshotEdgeFields {
    type= 'type',
    name_or_index = 'name_or_index',
    to_node = 'to_node'
}

// edge_types
export enum V8SnapshotEdgeTypes {
    context = 'context',
    element='element',
    property='property',
    internal='internal',
    hidden='hidden',
    shortcut='shortcut',
    weak='weak',
    string_or_number='string_or_number',
    node= 'node'
}

// trace_function_info_fields
export enum V8SnapshotTraceFunctionInfoFields {
    function_id = 'function_id',
    name = 'name',
    script_name = 'script_name',
    script_id = 'script_id',
    line = 'line',
    column= 'column'
}

// trace_node_fields
export enum V8SnapshotTraceNodeFields {
    id = 'id',
    function_info_index='function_info_index',
    count = 'count',
    size = 'size',
    children = 'children'
}

// sample_fields
export enum V8SnapshotSampleFields {
    'timestamp_us' = 'timestamp_us',
    'last_assigned_id' = 'last_assigned_id'
}

// location_fields
export enum V8SnapshotLocationFields {
    object_index = 'object_index',
    script_id='script_id',
    line='line',
    column='column'
}

export interface V8Snapshot {
    snapshot: {
        meta: {
            node_fields: Array<V8SnapshotNodeFields>,
            node_types: Array<V8SnapshotNodeTypes | V8SnapshotNodeTypes[]>,
            edge_fields: Array<V8SnapshotEdgeFields>,
            edge_types: Array<V8SnapshotEdgeTypes | V8SnapshotEdgeTypes[]>,
            trace_function_info_fields: Array<V8SnapshotTraceFunctionInfoFields>,
            trace_node_fields: Array<V8SnapshotTraceNodeFields>,
            sample_fields : Array<V8SnapshotSampleFields>,
            location_fields: Array<V8SnapshotLocationFields>
        },
        node_count: number,
        edge_count: number,
        trace_function_count: number
    },
    nodes: Array<number>,
    edges: Array<number>,
    trace_function_infos: Array<number>,
    trace_tree: Array<number>,
    samples: Array<number>,
    locations: Array<number>,
    strings: Array<string>
}

export default V8Snapshot;
