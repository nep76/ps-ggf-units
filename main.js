let result_tree = {};

function searchEvent( event )
{
    event.preventDefault();
    searchUnit();
}

function resolv_ref( unit )
{
    if( ! Object.hasOwn( unit, "_ref" ) ) return;

    const refs = unit._ref;
    delete unit._ref;

    for( const unitname of refs ){
        const merge_unit = UnitsData[unitname];

        for( const key in merge_unit ){
            if( key === "stage" ){
                if( ! Object.hasOwn( unit, key ) ) unit[key] = {};

                for( const title in merge_unit.stage ){
                    unit.stage[title] = [ ...new Set( [...( unit.stage[title] ?? [] ), ...merge_unit.stage[title] ] ) ];
                }
            } else{
                if( Array.isArray( merge_unit[key] ) ){
                    unit[key] = [ ...new Set( [...( unit[key] ?? [] ), ...( merge_unit[key] ?? [] ) ] ) ];
                } else if( typeof merge_unit[key] === "object" ){
                    unit[key] = { ...( unit[key] ?? {} ), ...( merge_unit[key] ?? {} ) };
                } else{
                    unit[key] = merge_unit[key];
                }
            }
        }
    }
}

function is_match( a, b, fizzy )
{
    const _a = normalize( a );
    const _ta = normalize( _t(a) );
    const _b = normalize( b );

    return fizzy ? ( _a.includes( _b ) || _ta.includes( _b ) ) : ( _a == _b || _ta == _b );
}

function contains( data, target )
{
    if( Array.isArray( data ) )
        return data.some( item => contains( item, target ) );

    if( data !== null && typeof data === "object" ){
        if( Object.keys( data ).some( key => contains( key, target ) ) ) return true;
        if( Object.values( data ).some( value => contains( value, target ) ) ) return true;
    }

    return typeof data === "string" ? is_match( data, target, true ) : data === target;
}

function _a( element, key )
{
    const a = document.createElement( "a" );
    a.textContent = _t(key);

    if( key.at( 0 ) != '[' ) a.href = "#" + encodeURIComponent( key );

    element.appendChild( a );
}

function _t( str )
{
    return Object.hasOwn( TransJA, str ) ? TransJA[str] : str;
}

function normalize( str )
{
    return str.normalize("NFKC").toLowerCase().replace(/[\s\-_・]/g, "");
}

function searchUnit( str )
{
    const name = str;
    const result = document.getElementById("ggf-unit-search-result");
    let match = null;

    result.replaceChildren();

    if( ! str ) return;

    const units = Object.keys( UnitsData ).filter( key => {
        if( is_match( key, name, false ) ) match = key;
        return is_match( key, name, true ) || contains( UnitsData[key], name );
    } );

    let e;

    if ( ! units.length ) {
        const e = document.createElement( "p" );
        e.textContent = "見つかりませんでした。";
        result.appendChild( e );
        return;
    }

    if( ! match ) match = units[0];
    const unit = {
        name: match,
        data: UnitsData[match]
    };

    resolv_ref( unit.data );

    result_tree["match"].replaceChildren();
    for( const item of units ){
        result_tree["match"].appendChild( ( e = document.createElement( "li") ) );
        _a( e, _t(item) );
    }

    result_tree["unitname"].textContent = _t(unit.name);

    result_tree["design"].replaceChildren();
    if( Object.hasOwn( unit.data, "design" ) ){
        for( const design of unit.data.design ){
            result_tree["design"].appendChild( ( e = document.createElement( "ul" ) ) );
            e.appendChild( document.createElement( "li" ) );
            e.appendChild( document.createElement( "li" ) );
            _a( e.firstChild, _t(design[0]) );
            _a( e.lastChild, _t(design[1]) );
        }
    }

    result_tree["dev-to"].replaceChildren();
    if( Object.hasOwn( unit.data, "development" ) ){
        for( const development of unit.data.development ){
            result_tree["dev-to"].appendChild( ( e = document.createElement( "li" ) ) );
            _a( e, _t(development) );
        }
    } else{
        result_tree["dev-to"].appendChild( ( e = document.createElement( "li" ) ) );
        e.textContent = "なし";
    }

    result_tree["dev-from"].replaceChildren();
    {
        const dev_from = Object.keys( UnitsData ).filter( key => {
            if( Object.hasOwn( UnitsData[key], "development" ) ){
                for( const src_unit of UnitsData[key]["development"] ){
                    if( src_unit === match ) return true;
                }
            }
            return false;
        } );

        if( dev_from.length ){
            for( const src_unit of dev_from ){
                result_tree["dev-from"].appendChild( ( e = document.createElement( "li" ) ) );
                _a( e, _t(src_unit) );
            }
        } else{
            result_tree["dev-from"].appendChild( ( e = document.createElement( "li" ) ) );
            e.textContent = "なし";
        }
    }

    result_tree["stage"].replaceChildren();
    if( Object.hasOwn( unit.data, "stage" ) ){
        for( const stage in unit.data.stage ){
            result_tree["stage"].appendChild( ( e = document.createElement( "li" ) ) );
            e.textContent = _t(stage) + " Stage " + unit.data.stage[stage].join( ", " );
        }
    } else{
        result_tree["stage"].appendChild( ( e = document.createElement( "li" ) ) );
        e.textContent = "なし";
    }

    result_tree["note"].replaceChildren();
    if( Object.hasOwn( unit.data, "note" ) ){
        for( const note of unit.data.note ){
            result_tree["note"].appendChild( ( e = document.createElement( "li" ) ) );
            e.textContent = _t(note);
        }
    } else{
        result_tree["note"].appendChild( ( e = document.createElement( "li" ) ) );
        e.textContent = "なし";
    }

    result_tree["code"].replaceChildren();
    if( Object.hasOwn( unit.data, "code" ) ){
        for( const code of unit.data.code ){
            result_tree["code"].appendChild( ( e = document.createElement( "li" ) ) );
            e.textContent = code;
        }
    } else{
        result_tree["code"].appendChild( ( e = document.createElement( "li" ) ) );
        e.textContent = "なし";
    }

    result.appendChild( result_tree["main"] );
}

function ev_loadhash( e )
{
    const hash = decodeURIComponent( location.hash.slice( 1 ) );

    document.getElementById("ggf-unit-search-name").value = hash;
    searchUnit( hash );
}

result_tree["main"]     = document.createElement( "div" );
result_tree["unitname"] = document.createElement( "h2" );
result_tree["design"]   = document.createElement( "div" );
result_tree["dev-to"]   = document.createElement( "ul" );
result_tree["dev-from"] = document.createElement( "ul" );
result_tree["stage"]    = document.createElement( "ul" );
result_tree["note"]     = document.createElement( "ul" );
result_tree["code"]     = document.createElement( "ul" );
result_tree["match"]    = document.createElement( "ul" );

result_tree["unitname"].id = "unitname";
result_tree["design"].id   = "design";
result_tree["dev-to"].id   = "development-to";
result_tree["dev-from"].id = "development-from";
result_tree["stage"].id    = "stage";
result_tree["note"].id     = "note";
result_tree["code"].id     = "code";
result_tree["match"].id    = "match";

{
    let e;
    result_tree["main"].appendChild( result_tree["unitname"] );

    result_tree["main"].appendChild( ( e = document.createElement( "h3" ) ) );
    e.textContent = "設計";
    result_tree["main"].appendChild( result_tree["design"] );
    
    result_tree["main"].appendChild( ( e = document.createElement( "h3" ) ) );
    e.textContent = "開発元";
    result_tree["main"].appendChild( result_tree["dev-from"] );

    result_tree["main"].appendChild( ( e = document.createElement( "h3" ) ) );
    e.textContent = "開発";
    result_tree["main"].appendChild( result_tree["dev-to"] );

    result_tree["main"].appendChild( ( e = document.createElement( "h3" ) ) );
    e.textContent = "ACE登録/捕獲 ステージ例";
    result_tree["main"].appendChild( result_tree["stage"] );

    result_tree["main"].appendChild( ( e = document.createElement( "h3" ) ) );
    e.textContent = "備考";
    result_tree["main"].appendChild( result_tree["note"] );

    result_tree["main"].appendChild( ( e = document.createElement( "h3" ) ) );
    e.textContent = "黒歴史コード";
    result_tree["main"].appendChild( result_tree["code"] );
    
    result_tree["main"].appendChild( result_tree["match"] );
}

document.getElementById("ggf-unit-search-form").addEventListener("submit", ( event ) => {
    event.preventDefault();
    
    const query = document.getElementById("ggf-unit-search-name").value.trim();

    if( ! query ) return;
    location.hash = encodeURIComponent( query );
});

window.addEventListener("hashchange", ev_loadhash );

document.addEventListener( "DOMContentLoaded", ev_loadhash );
