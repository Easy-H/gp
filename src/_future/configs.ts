export interface LanguageConfig {
  name: string;
  wasm: string;
  classNodes: string[];
  methodNodes: string[];
  fieldNodes: string[];
  parameterNodes?: string[];
  extendsNodes?: string[];
  implementsNodes?: string[];
}

export const LANGUAGE_CONFIG: Record<string, LanguageConfig> = {
  js: { name: 'javascript', wasm: 'javascript', 
        classNodes: ['class_declaration', 'class'], 
        methodNodes: ['method_definition'], 
        fieldNodes: ['field_definition', 'public_instance_level_property_definition'],
        parameterNodes: ['formal_parameters', 'parameters'],
        extendsNodes: ['class_heritage'] },
  jsx: { name: 'javascript', wasm: 'javascript', 
        classNodes: ['class_declaration', 'class'], 
        methodNodes: ['method_definition'], 
        fieldNodes: ['field_definition'],
        parameterNodes: ['formal_parameters', 'parameters'],
        extendsNodes: ['class_heritage'] },
  ts: { name: 'typescript', wasm: 'typescript', 
        classNodes: ['class_declaration', 'interface_declaration'], 
        methodNodes: ['method_definition', 'method_signature'], 
        fieldNodes: ['property_definition', 'property_signature'],
        parameterNodes: ['formal_parameters', 'parameters'],
        extendsNodes: ['extends_clause'],
        implementsNodes: ['implements_clause'] },
  tsx: { name: 'tsx', wasm: 'tsx', 
        classNodes: ['class_declaration', 'interface_declaration'], 
        methodNodes: ['method_definition', 'method_signature'], 
        fieldNodes: ['property_definition', 'property_signature'],
        parameterNodes: ['formal_parameters', 'parameters'],
        extendsNodes: ['extends_clause'],
        implementsNodes: ['implements_clause'] },
  java: { name: 'java', wasm: 'java', 
          classNodes: ['class_declaration', 'interface_declaration'], 
          methodNodes: ['method_declaration', 'interface_method_definition', 'constructor_declaration'], 
          fieldNodes: ['field_declaration', 'constant_declaration'],
          parameterNodes: ['formal_parameters', 'parameters'],
          extendsNodes: ['superclass', 'extends_interfaces'],
          implementsNodes: ['interfaces'] },
  py: { name: 'python', wasm: 'python', 
        classNodes: ['class_definition'], 
        methodNodes: ['function_definition', 'decorated_definition'], 
        fieldNodes: ['assignment'],
        parameterNodes: ['parameters'],
        extendsNodes: ['argument_list'] },
  cpp: { name: 'cpp', wasm: 'cpp', 
         classNodes: ['class_specifier', 'struct_specifier'], 
         methodNodes: ['function_definition'], 
         fieldNodes: ['field_declaration'],
         parameterNodes: ['parameter_list', 'parameters'],
         extendsNodes: ['base_class_clause'] },
  cs: { name: 'c_sharp', wasm: 'c_sharp', 
         classNodes: ['class_declaration', 'struct_declaration', 'interface_declaration', 'enum_declaration'], 
         methodNodes: ['method_declaration', 'interface_method_definition'], 
         fieldNodes: ['field_declaration', 'property_declaration', 'enum_member_declaration'],
         parameterNodes: ['parameter_list', 'parameters', 'formal_parameters'],
         extendsNodes: ['base_list'] },
};
