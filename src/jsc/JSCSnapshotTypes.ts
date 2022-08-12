export interface ISCSnapshot {
  version: number,
  type: string, // "Inspector"
  nodes: number[],
  nodeClassNames: string[], // ["<root>","JSLexicalEnvironment","Arguments","FunctionCodeBlock","FunctionExecutable","HashMapBucket","string","Function","Object","e","t","FunctionRareData","Va","Array","ExecutableToCodeBlockEdge","Structure","StructureRareData","SymbolTable","PropertyTable","Map","Set","BigInt","Callee","String","GetterSetter","SparseArrayValueMap","UnlinkedFunctionExecutable","UnlinkedFunctionCodeBlock","Immutable Butterfly","s","o","RegExp","Error","JSPropertyNameEnumerator","u","T","CallbackFunction","StructureChain","Iterator","AsyncIterator","Generator","AsyncGenerator","Array Iterator","Map Iterator","symbol","CallbackObject","GlobalObject","UnlinkedProgramCodeBlock","ProgramExecutable","WeakMap","JSGlobalLexicalEnvironment","NativeExecutable","y","r","C","Uint8Array","i","Connect(r)","Boolean","Number","JSProxy","L","Promise","Connect(t)","Set Iterator","WeakRef","FinalizationRegistry","InternalPromisePrototype","String Iterator","GeneratorFunction","AsyncFunction","AsyncGeneratorFunction","Intl","Intl.DisplayNames","Intl.ListFormat","AsyncFromSyncIterator","RegExp String Iterator","WebAssembly","Symbol","WeakSet","Intl.NumberFormat","Float64ArrayPrototype","Float32ArrayPrototype","Uint32ArrayPrototype","Int32ArrayPrototype","Uint16ArrayPrototype","Int16ArrayPrototype","Uint8ArrayPrototype","ArrayBuffer","Uint8ClampedArrayPrototype","Int8ArrayPrototype","Prototype","DataView","JSON","Reflect","Math","console","ScopedArgumentsTable","Qa"]
  edges: number[],
  edgeTypes: string[], // ["Internal","Property","Index","Variable"]
  edgeNames: string[]
}
