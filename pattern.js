export let xmlTemplate = '<?xml version="1.0" encoding="UTF-8"?>\
<wfs:GetFeature xmlns:wfs="http://www.opengis.net/wfs/2.0" service="WFS" version="2.0.0"\
                outputFormat="application/json" xmlns:gml="http://www.opengis.net/gml"\
                xmlns:core="http://www.opengis.net/citygml/2.0" xmlns:fes="http://www.opengis.net/fes/2.0">\
    <wfs:Query typeNames="schema-element(core:_CityObject)">\
        <fes:Filter>\
            <fes:Intersects>\
                <fes:ValueReference>gml:boundedBy</fes:ValueReference>\
                <gml:Polygon srsName="http://www.opengis.net/def/crs/epsg/0/4326">\
                    <gml:exterior>\
                        <gml:LinearRing>\
                            <gml:posList>\
                                {{coordinatesList}}\
                            </gml:posList>\
                        </gml:LinearRing>\
                    </gml:exterior>\
                </gml:Polygon>\
            </fes:Intersects>\
        </fes:Filter>\
    </wfs:Query>\
</wfs:GetFeature>'
