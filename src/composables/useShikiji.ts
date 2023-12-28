import { fromHighlighter } from 'markdown-it-shikiji/core'
import { getHighlighterCore } from 'shikiji/core'
import { getWasmInlined } from 'shikiji/wasm'

export default function useShikiji() {
  const MarkdownItShikiji = async (theme: 'light' | 'dark' = 'light') => {
    const highlighter = await getHighlighterCore({
      themes: [
        import('shikiji/themes/material-theme-lighter.mjs'),
        import('shikiji/themes/material-theme-palenight.mjs'),
      ],
      // TODO: For now, I'm including all languages but this bumps up the package size ~6MB
      langs: [
        import('shikiji/langs/abap.mjs'),
        import('shikiji/langs/actionscript-3.mjs'),
        import('shikiji/langs/ada.mjs'),
        import('shikiji/langs/apache.mjs'),
        import('shikiji/langs/apex.mjs'),
        import('shikiji/langs/apl.mjs'),
        import('shikiji/langs/applescript.mjs'),
        import('shikiji/langs/ara.mjs'),
        import('shikiji/langs/asm.mjs'),
        import('shikiji/langs/astro.mjs'),
        import('shikiji/langs/awk.mjs'),
        import('shikiji/langs/ballerina.mjs'),
        import('shikiji/langs/bat.mjs'),
        import('shikiji/langs/beancount.mjs'),
        import('shikiji/langs/berry.mjs'),
        import('shikiji/langs/bibtex.mjs'),
        import('shikiji/langs/bicep.mjs'),
        import('shikiji/langs/blade.mjs'),
        import('shikiji/langs/c.mjs'),
        import('shikiji/langs/cadence.mjs'),
        import('shikiji/langs/clarity.mjs'),
        import('shikiji/langs/clojure.mjs'),
        import('shikiji/langs/cmake.mjs'),
        import('shikiji/langs/cobol.mjs'),
        import('shikiji/langs/codeql.mjs'),
        import('shikiji/langs/coffee.mjs'),
        import('shikiji/langs/cpp.mjs'),
        import('shikiji/langs/crystal.mjs'),
        import('shikiji/langs/csharp.mjs'),
        import('shikiji/langs/css.mjs'),
        import('shikiji/langs/csv.mjs'),
        import('shikiji/langs/cue.mjs'),
        import('shikiji/langs/cypher.mjs'),
        import('shikiji/langs/d.mjs'),
        import('shikiji/langs/dart.mjs'),
        import('shikiji/langs/dax.mjs'),
        import('shikiji/langs/diff.mjs'),
        import('shikiji/langs/docker.mjs'),
        import('shikiji/langs/dream-maker.mjs'),
        import('shikiji/langs/elixir.mjs'),
        import('shikiji/langs/elm.mjs'),
        import('shikiji/langs/erb.mjs'),
        import('shikiji/langs/erlang.mjs'),
        import('shikiji/langs/fish.mjs'),
        import('shikiji/langs/fsharp.mjs'),
        import('shikiji/langs/gdresource.mjs'),
        import('shikiji/langs/gdscript.mjs'),
        import('shikiji/langs/gdshader.mjs'),
        import('shikiji/langs/gherkin.mjs'),
        import('shikiji/langs/git-commit.mjs'),
        import('shikiji/langs/git-rebase.mjs'),
        import('shikiji/langs/glimmer-js.mjs'),
        import('shikiji/langs/glimmer-ts.mjs'),
        import('shikiji/langs/glsl.mjs'),
        import('shikiji/langs/gnuplot.mjs'),
        import('shikiji/langs/go.mjs'),
        import('shikiji/langs/graphql.mjs'),
        import('shikiji/langs/groovy.mjs'),
        import('shikiji/langs/hack.mjs'),
        import('shikiji/langs/haml.mjs'),
        import('shikiji/langs/handlebars.mjs'),
        import('shikiji/langs/haskell.mjs'),
        import('shikiji/langs/hcl.mjs'),
        import('shikiji/langs/hjson.mjs'),
        import('shikiji/langs/hlsl.mjs'),
        import('shikiji/langs/html.mjs'),
        import('shikiji/langs/imba.mjs'),
        import('shikiji/langs/ini.mjs'),
        import('shikiji/langs/java.mjs'),
        import('shikiji/langs/javascript.mjs'),
        import('shikiji/langs/jinja.mjs'),
        import('shikiji/langs/jison.mjs'),
        import('shikiji/langs/json.mjs'),
        import('shikiji/langs/json5.mjs'),
        import('shikiji/langs/jsonc.mjs'),
        import('shikiji/langs/jsonl.mjs'),
        import('shikiji/langs/jsonnet.mjs'),
        import('shikiji/langs/jssm.mjs'),
        import('shikiji/langs/jsx.mjs'),
        import('shikiji/langs/julia.mjs'),
        import('shikiji/langs/kotlin.mjs'),
        import('shikiji/langs/kusto.mjs'),
        import('shikiji/langs/latex.mjs'),
        import('shikiji/langs/less.mjs'),
        import('shikiji/langs/liquid.mjs'),
        import('shikiji/langs/lisp.mjs'),
        import('shikiji/langs/logo.mjs'),
        import('shikiji/langs/lua.mjs'),
        import('shikiji/langs/make.mjs'),
        import('shikiji/langs/markdown.mjs'),
        import('shikiji/langs/marko.mjs'),
        import('shikiji/langs/matlab.mjs'),
        import('shikiji/langs/mdc.mjs'),
        import('shikiji/langs/mdx.mjs'),
        import('shikiji/langs/mermaid.mjs'),
        import('shikiji/langs/mojo.mjs'),
        import('shikiji/langs/narrat.mjs'),
        import('shikiji/langs/nextflow.mjs'),
        import('shikiji/langs/nginx.mjs'),
        import('shikiji/langs/nim.mjs'),
        import('shikiji/langs/nix.mjs'),
        import('shikiji/langs/nushell.mjs'),
        import('shikiji/langs/objective-c.mjs'),
        import('shikiji/langs/objective-cpp.mjs'),
        import('shikiji/langs/ocaml.mjs'),
        import('shikiji/langs/pascal.mjs'),
        import('shikiji/langs/perl.mjs'),
        import('shikiji/langs/php.mjs'),
        import('shikiji/langs/plsql.mjs'),
        import('shikiji/langs/postcss.mjs'),
        import('shikiji/langs/powerquery.mjs'),
        import('shikiji/langs/powershell.mjs'),
        import('shikiji/langs/prisma.mjs'),
        import('shikiji/langs/prolog.mjs'),
        import('shikiji/langs/proto.mjs'),
        import('shikiji/langs/pug.mjs'),
        import('shikiji/langs/puppet.mjs'),
        import('shikiji/langs/purescript.mjs'),
        import('shikiji/langs/python.mjs'),
        import('shikiji/langs/r.mjs'),
        import('shikiji/langs/raku.mjs'),
        import('shikiji/langs/razor.mjs'),
        import('shikiji/langs/reg.mjs'),
        import('shikiji/langs/rel.mjs'),
        import('shikiji/langs/riscv.mjs'),
        import('shikiji/langs/rst.mjs'),
        import('shikiji/langs/ruby.mjs'),
        import('shikiji/langs/rust.mjs'),
        import('shikiji/langs/sas.mjs'),
        import('shikiji/langs/sass.mjs'),
        import('shikiji/langs/scala.mjs'),
        import('shikiji/langs/scheme.mjs'),
        import('shikiji/langs/scss.mjs'),
        import('shikiji/langs/shaderlab.mjs'),
        import('shikiji/langs/shellscript.mjs'),
        import('shikiji/langs/shellsession.mjs'),
        import('shikiji/langs/smalltalk.mjs'),
        import('shikiji/langs/solidity.mjs'),
        import('shikiji/langs/sparql.mjs'),
        import('shikiji/langs/splunk.mjs'),
        import('shikiji/langs/sql.mjs'),
        import('shikiji/langs/ssh-config.mjs'),
        import('shikiji/langs/stata.mjs'),
        import('shikiji/langs/stylus.mjs'),
        import('shikiji/langs/svelte.mjs'),
        import('shikiji/langs/swift.mjs'),
        import('shikiji/langs/system-verilog.mjs'),
        import('shikiji/langs/tasl.mjs'),
        import('shikiji/langs/tcl.mjs'),
        import('shikiji/langs/tex.mjs'),
        import('shikiji/langs/toml.mjs'),
        import('shikiji/langs/tsx.mjs'),
        import('shikiji/langs/turtle.mjs'),
        import('shikiji/langs/twig.mjs'),
        import('shikiji/langs/typescript.mjs'),
        import('shikiji/langs/v.mjs'),
        import('shikiji/langs/vb.mjs'),
        import('shikiji/langs/verilog.mjs'),
        import('shikiji/langs/vhdl.mjs'),
        import('shikiji/langs/viml.mjs'),
        import('shikiji/langs/vue.mjs'),
        import('shikiji/langs/vue-html.mjs'),
        import('shikiji/langs/vyper.mjs'),
        import('shikiji/langs/wasm.mjs'),
        import('shikiji/langs/wenyan.mjs'),
        import('shikiji/langs/wgsl.mjs'),
        import('shikiji/langs/wolfram.mjs'),
        import('shikiji/langs/xml.mjs'),
        import('shikiji/langs/xsl.mjs'),
        import('shikiji/langs/yaml.mjs'),
        import('shikiji/langs/zenscript.mjs'),
        import('shikiji/langs/zig.mjs'),
      ],
      loadWasm: getWasmInlined,
    })

    return fromHighlighter(highlighter, {
      theme: theme === 'light' ? 'material-theme-lighter' : 'material-theme-palenight',
    })
  }

  return {
    MarkdownItShikiji,
  }
}
