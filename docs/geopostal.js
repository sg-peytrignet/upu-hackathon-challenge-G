importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

function sendPatch(patch, buffers, msg_id) {
  self.postMessage({
    type: 'patch',
    patch: patch,
    buffers: buffers
  })
}

async function startApplication() {
  console.log("Loading pyodide!");
  self.postMessage({type: 'status', msg: 'Loading pyodide'})
  self.pyodide = await loadPyodide();
  self.pyodide.globals.set("sendPatch", sendPatch);
  console.log("Loaded!");
  await self.pyodide.loadPackage("micropip");
  const env_spec = ['https://cdn.holoviz.org/panel/wheels/bokeh-3.4.1-py3-none-any.whl', 'https://cdn.holoviz.org/panel/1.4.4/dist/wheels/panel-1.4.4-py3-none-any.whl', 'pyodide-http==0.2.1', 'branca', 'colorcet', 'folium', 'geopandas', 'holoviews', 'hvplot', 'matplotlib', 'numpy', 'pandas']
  for (const pkg of env_spec) {
    let pkg_name;
    if (pkg.endsWith('.whl')) {
      pkg_name = pkg.split('/').slice(-1)[0].split('-')[0]
    } else {
      pkg_name = pkg
    }
    self.postMessage({type: 'status', msg: `Installing ${pkg_name}`})
    try {
      await self.pyodide.runPythonAsync(`
        import micropip
        await micropip.install('${pkg}');
      `);
    } catch(e) {
      console.log(e)
      self.postMessage({
	type: 'status',
	msg: `Error while installing ${pkg_name}`
      });
    }
  }
  console.log("Packages loaded!");
  self.postMessage({type: 'status', msg: 'Executing code'})
  const code = `
  \nimport asyncio\n\nfrom panel.io.pyodide import init_doc, write_doc\n\ninit_doc()\n\nfrom panel import state as _pn__state\nfrom panel.io.handlers import CELL_DISPLAY as _CELL__DISPLAY, display, get_figure as _get__figure\n\nimport numpy as np\nimport pandas as pd\nimport holoviews as hv\nimport panel as pn\nimport folium\nimport json\nimport matplotlib.cm as cm  # Import colormap library\nimport geopandas as gpd\nimport branca.colormap as cm\nfrom colorcet import bmy\n\npn.extension('tabulator', template='fast')\nimport hvplot.pandas\n_pn__state._cell_outputs['df3cf9ed-a109-410b-9955-0dcb42d06eac'].append("""## Create intro""")\nintroduction = pn.pane.Markdown("""\n<h1>GeoPostal Insight</h1>\nUPU Innovation Challenge 2024\n""", width=600)\n\npanel_logo = pn.pane.PNG(\n    'https://panel.holoviz.org/_static/logo_stacked.png',\n    link_url='https://panel.holoviz.org', height=95, align='center'\n)\n\nevent_logo = pn.pane.PNG(\n    'https://upload.wikimedia.org/wikipedia/commons/2/2d/Universal_Postal_Union_logo.svg',\n    link_url='https://dribdat.hackathon.post/event/3', height=95, align='center'\n)\n\nitu_logo = pn.pane.PNG(\n    'https://upload.wikimedia.org/wikipedia/commons/e/e1/International_Telecommunication_Union_logo.svg',\n    link_url='https://dribdat.hackathon.post/event/3', height=95, align='center'\n)\n\nintro = pn.Row(\n    event_logo,\n    itu_logo,\n    introduction,\n    pn.layout.HSpacer(),\n    panel_logo,\n    sizing_mode='stretch_width'\n)\n\n_pn__state._cell_outputs['a2d16e0e-9dd5-4f04-8724-4e25ac07f34f'].append((intro))\nfor _cell__out in _CELL__DISPLAY:\n    _pn__state._cell_outputs['a2d16e0e-9dd5-4f04-8724-4e25ac07f34f'].append(_cell__out)\n_CELL__DISPLAY.clear()\n_fig__out = _get__figure()\nif _fig__out:\n    _pn__state._cell_outputs['a2d16e0e-9dd5-4f04-8724-4e25ac07f34f'].append(_fig__out)\n\n_pn__state._cell_outputs['130476bf-0923-46ec-bb39-f349439127e7'].append("""### Load and cache data""")\nfrom holoviews.element.tiles import lon_lat_to_easting_northing\n\n@pn.cache\ndef load_data():\n    df = pd.read_csv('data/brazil_geodata_h3_res4.csv')\n    df['x'], df['y'] = lon_lat_to_easting_northing(df['X'], df['Y'])\n    return df\n\ndf = load_data()\n\n_pn__state._cell_outputs['361cec45-e131-44f8-8dad-32706e187ded'].append((df.tail()))\nfor _cell__out in _CELL__DISPLAY:\n    _pn__state._cell_outputs['361cec45-e131-44f8-8dad-32706e187ded'].append(_cell__out)\n_CELL__DISPLAY.clear()\n_fig__out = _get__figure()\nif _fig__out:\n    _pn__state._cell_outputs['361cec45-e131-44f8-8dad-32706e187ded'].append(_fig__out)\n\n_pn__state._cell_outputs['4d9b4125-eef1-4d28-9557-315f8fb42737'].append("""### Set up linked selections""")\nls = hv.link_selections.instance()\n\ndef clear_selections(event):\n    ls.selection_expr = None\n\nclear_button = pn.widgets.Button(name='Clear', align='center')\n\nclear_button.param.watch(clear_selections, 'clicks');\n\ntotal_area = df.road_length_km.sum()\n\ndef count(data):\n    selected_area  = np.sum(data['road_length_km'])\n    selected_percentage = selected_area / total_area * 100\n    return f'## Roads: {len(data)} | Selected: {selected_area:.0f} km ({selected_percentage:.1f}%)</font>'\n\n_pn__state._cell_outputs['336c6b94-062c-4409-b67b-327089616d91'].append((pn.Row(\n    pn.pane.Markdown(pn.bind(count, ls.selection_param(df)), align='center', width=600),\n    clear_button\n).servable(area='header', title='GeoPostal Insight')))\nfor _cell__out in _CELL__DISPLAY:\n    _pn__state._cell_outputs['336c6b94-062c-4409-b67b-327089616d91'].append(_cell__out)\n_CELL__DISPLAY.clear()\n_fig__out = _get__figure()\nif _fig__out:\n    _pn__state._cell_outputs['336c6b94-062c-4409-b67b-327089616d91'].append(_fig__out)\n\ninstruction = pn.pane.Markdown("""\n\U0001f4a1 This dashboard visualizes postal offices, allows exploring the relationships between regional characteristics such as transport and telco infrastructures, complementary public services. Use Box-select on each plot to subselect and hit the "Clear" button to reset. Here you can ask prompts about our model, for example:\n<ul><li>Create a report about the state of postal sector in Manaus region of Brazil.</li>\n<li>What is the Integrated Index for Postal Development?</li></ul>\n""", width=700)\n\n# Todo: replace dynamically with output of prompt\nhugging_pane = pn.pane.HTML("""\n<iframe src="https://hf.co/chat/assistant/6659aa1af82f39d447cd13f3" width="100%" height="460" frameborder="0"></iframe>\n""", width=700)\n_pn__state._cell_outputs['1672cc65-1ef4-40ce-9658-3bf6c43bdda4'].append("""## Rich mapping""")\n# Load the GeoJSON data\ngeojson_data = "data/brazil_geodata_h3_res4.geojson"\ngdf = gpd.read_file(geojson_data)\n\n# Calculate the population count deciles for color mapping\npopulation_counts = gdf['population_count']\npopulation_deciles = pd.qcut(population_counts, 10, labels=False, duplicates='drop')\n\n# Create a dictionary to map each population count to its decile\npop_count_to_decile = dict(zip(population_counts, population_deciles))\n\n# Create a linear colormap\ncolormap = cm.linear.YlOrRd_09.scale(0, 9)\ncolormap = colormap.to_step(10)  # Use 10 steps for the deciles\n\n# Define a function to style the features\ndef style_function(feature):\n    population_count = feature['properties']['population_count']\n    decile = pop_count_to_decile[population_count]\n    return {\n        'fillOpacity': 0.7,\n        'weight': 0,\n        'fillColor': colormap(decile)\n    }\n\n# Create the map\nm = folium.Map(location=[-9.29, -51.81], zoom_start=3, tiles="cartodb positron")\nfolium_pane = pn.pane.plot.Folium(m, height=460)\nfolium.Marker(\n    [-9.29, -51.81], popup="<i>Brazil</i>", tooltip="Work in progress!"\n).add_to(m)\n\n# Add the GeoJSON data to the map with the style function\nfolium.GeoJson(\n    geojson_data,\n    style_function=style_function,\n    tooltip=folium.GeoJsonTooltip(fields=['population_count']),\n    name="GeoPostal Impact"\n).add_to(m)\n\n# Add a layer control\nfolium.LayerControl().add_to(m)\n\n# Set the pane object to the map\nfolium_pane.object = m\n\n# Create the dashboard layout\nh3ai = pn.Row(\n    folium_pane,\n    hugging_pane\n)\n_pn__state._cell_outputs['2e78ca93-719a-4fd8-b5e4-9127cf23a845'].append((h3ai))\nfor _cell__out in _CELL__DISPLAY:\n    _pn__state._cell_outputs['2e78ca93-719a-4fd8-b5e4-9127cf23a845'].append(_cell__out)\n_CELL__DISPLAY.clear()\n_fig__out = _get__figure()\nif _fig__out:\n    _pn__state._cell_outputs['2e78ca93-719a-4fd8-b5e4-9127cf23a845'].append(_fig__out)\n\n_pn__state._cell_outputs['4a1834f9-5759-448e-86eb-28f92d99d1c6'].append("""### Create plots""")\ndf['post_offices_count_int'] = df['post_offices_count'].fillna(0).astype(int)\ndf['postal_bank_count_int'] = df['postal_bank_count'].fillna(0).astype(int)\n\ngeo = df.hvplot.points(\n    'x', 'y', rasterize=True, tools=['hover'], tiles='OSM', cmap=bmy, logz=False, colorbar=True,\n    xaxis=None, yaxis=False, min_height=400, responsive=True\n).opts('Tiles', alpha=0.8)\n\nscatter1 = df.hvplot.scatter(\n    'post_offices_count', 'population_count', \n    xlabel='Post offices', ylabel='Population', color='postal_bank_count_int', responsive=True, min_height=400\n)\n\nscatter2 = df.hvplot.scatter(\n    'road_length_km', 'post_offices_count', \n    xlabel='Road length', ylabel='Post offices', responsive=True, min_height=400\n)\n\nscatter3 = df.hvplot.scatter(\n    'cell_towers_count', 'post_offices_count', \n    xlabel='Cell towers', ylabel='Post offices', responsive=True, min_height=400\n)\n\nhist1 = df.hvplot.hist(\n    'post_offices_count_int', xlabel='Number of Post offices',\n    fontscale=1.2, responsive=True, min_height=350, fill_color='#85c1e9'\n)\n\n\nhist2 = df.hvplot.hist(\n    'postal_bank_count_int', xlabel='Number of Postal banks',\n    fontscale=1.2, responsive=True, min_height=350, fill_color='#f1948a'\n)\n\nplots = pn.pane.HoloViews(ls(geo + scatter1 + hist1 + hist2 + scatter2 + scatter3).cols(2).opts(sizing_mode='stretch_both'))\n_pn__state._cell_outputs['b9b79640-3acf-4722-8038-d192283100a9'].append((plots))\nfor _cell__out in _CELL__DISPLAY:\n    _pn__state._cell_outputs['b9b79640-3acf-4722-8038-d192283100a9'].append(_cell__out)\n_CELL__DISPLAY.clear()\n_fig__out = _get__figure()\nif _fig__out:\n    _pn__state._cell_outputs['b9b79640-3acf-4722-8038-d192283100a9'].append(_fig__out)\n\n_pn__state._cell_outputs['28fc8348-3ef0-4028-ac73-3bcc9e09b46e'].append("""## Dashboard content\n""")\n_pn__state._cell_outputs['28b00ffa-6ffb-4775-87aa-320710a2b8a1'].append((pn.Column(intro, instruction, h3ai, plots, sizing_mode='stretch_both').servable()))\nfor _cell__out in _CELL__DISPLAY:\n    _pn__state._cell_outputs['28b00ffa-6ffb-4775-87aa-320710a2b8a1'].append(_cell__out)\n_CELL__DISPLAY.clear()\n_fig__out = _get__figure()\nif _fig__out:\n    _pn__state._cell_outputs['28b00ffa-6ffb-4775-87aa-320710a2b8a1'].append(_fig__out)\n\n\nawait write_doc()
  `

  try {
    const [docs_json, render_items, root_ids] = await self.pyodide.runPythonAsync(code)
    self.postMessage({
      type: 'render',
      docs_json: docs_json,
      render_items: render_items,
      root_ids: root_ids
    })
  } catch(e) {
    const traceback = `${e}`
    const tblines = traceback.split('\n')
    self.postMessage({
      type: 'status',
      msg: tblines[tblines.length-2]
    });
    throw e
  }
}

self.onmessage = async (event) => {
  const msg = event.data
  if (msg.type === 'rendered') {
    self.pyodide.runPythonAsync(`
    from panel.io.state import state
    from panel.io.pyodide import _link_docs_worker

    _link_docs_worker(state.curdoc, sendPatch, setter='js')
    `)
  } else if (msg.type === 'patch') {
    self.pyodide.globals.set('patch', msg.patch)
    self.pyodide.runPythonAsync(`
    from panel.io.pyodide import _convert_json_patch
    state.curdoc.apply_json_patch(_convert_json_patch(patch), setter='js')
    `)
    self.postMessage({type: 'idle'})
  } else if (msg.type === 'location') {
    self.pyodide.globals.set('location', msg.location)
    self.pyodide.runPythonAsync(`
    import json
    from panel.io.state import state
    from panel.util import edit_readonly
    if state.location:
        loc_data = json.loads(location)
        with edit_readonly(state.location):
            state.location.param.update({
                k: v for k, v in loc_data.items() if k in state.location.param
            })
    `)
  }
}

startApplication()