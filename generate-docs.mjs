// generate-docs.mjs
import { useLogger } from '@nuxt/kit'

import { runGraphQLMarkdown } from '@graphql-markdown/cli';

const logger = useLogger('generate-docs')

const formatter = new URL('./graphql-markdown-formatter.mjs', import.meta.url).href

export async function generate() {
  try {
    await runGraphQLMarkdown({
      // Core Paths
      schema: './schema/api.graphql', 
      rootPath: './content',
      baseURL: 'api-reference', 
      linkRoot: '/',
      formatter,
      
      // Formatting fallback options to bypass the internal configuration setup
      loaders: {
        GraphQLFileLoader: '@graphql-tools/graphql-file-loader'
      },
      
      // Layout extraction flags
      printTypeOptions: {
        parentTypePrefix: false,
        relatedObjects: true,
        typeBadges: true,
        exampleSection: {
          directive: 'example'
        }
      },
      
      // Forces the library to gracefully initialize empty plugin arrays
      customDirective: {
        deprecatedType: {
          descriptor: (_directive, type) => {
            return type?.astNode?.directives
              ?.find(item => item.name.value === 'deprecatedType')
              ?.arguments?.find(argument => argument.name.value === 'reason')
              ?.value?.value ?? ''
          }
        }
      },
      groupByDirective: undefined
    }, { }, import.meta.resolve('consola'));
    logger.info('GraphQL Markdown generated in ./content/api-reference/');
  } catch (error) {
    logger.error('Generation failed');
    throw new Error(error)
  }
}
