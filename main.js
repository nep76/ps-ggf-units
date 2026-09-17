let ResultTree = {};
let ResetScrollPosition = false;

function resolv_ref( unit )
{
    if( ! Object.hasOwn( unit, "_ref" ) ) return;

    const refs = unit._ref;
    delete unit._ref;

    for( const unitname of refs ){
        const merge_unit = UnitsData[unitname];

        if( ! merge_unit ){
            console.log( "INVALID UNIT REFERENCE: " + unitname );
            continue;
        }
        
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
    a.href = "#" + encodeURIComponent( key );
    a.addEventListener( "click", ( e ) => { ResetScrollPosition = true; } );

    element.appendChild( a );
}

function _t( str )
{
    return Object.hasOwn( TransJA, str ) ? TransJA[str] : str;
}

function normalize( str )
{
    return str.normalize( "NFKC" ).toLowerCase().replace( /[\s\-_・]/g, "" );
}

function search_unit( str )
{
    const name = str;
    let match = null;

    if( ! str ) return;

    const units = Object.keys( UnitsData ).filter( key => {
        if( is_match( key, name, false ) ) match = key;
        return is_match( key, name, true ) || contains( UnitsData[key], name );
    } );

    let e;

    /*if ( match === null ) {
        const e = document.createElement( "p" );
        e.textContent = "見つかりませんでした。";
        result.appendChild( e );
    }*/

    units.sort( ( a, b ) => _t( a ).localeCompare( _t( b ), "ja" ) );

    if( ! match ){
        if( ! units.length ) return false;
        match = units[0];
    }

    const unit = {
        name: match,
        data: UnitsData[match]
    };

    resolv_ref( unit.data );

    ResultTree["match"].replaceChildren();
    for( const item of units ){
        if( item == match ) continue;
        ResultTree["match"].appendChild( ( e = document.createElement( "li") ) );
        _a( e, _t(item) );
    }

    ResultTree["unitname"].textContent = _t(unit.name);

    ResultTree["design"].replaceChildren();
    if( Object.hasOwn( unit.data, "design" ) && unit.data.design.length ){
        for( const design of unit.data.design ){
            ResultTree["design"].appendChild( ( e = document.createElement( "ul" ) ) );
            for( const material of design ){
                e.appendChild( document.createElement( "li" ) );
                if( Array.isArray( material ) ){
                    const mls = document.createElement( "ul" )
                    for( const _m of material ){
                        mls.appendChild( document.createElement( "li" ) );
                        _a( mls.lastChild, _t(_m) );
                    }
                    e.lastChild.appendChild( mls );
                } else{
                    _a( e.lastChild, _t(material) );
                }
            }
        }
    } else{
        ResultTree["design"].appendChild( ( e = document.createElement( "p" ) ) );
        e.textContent = "なし";
    }

    ResultTree["dev-to"].replaceChildren();
    if( Object.hasOwn( unit.data, "development" ) && unit.data.development.length ){
        for( const development of unit.data.development ){
            ResultTree["dev-to"].appendChild( ( e = document.createElement( "li" ) ) );
            _a( e, _t(development) );
        }
    } else{
        ResultTree["dev-to"].appendChild( ( e = document.createElement( "li" ) ) );
        e.textContent = "なし";
    }

    ResultTree["dev-from"].replaceChildren();
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
                ResultTree["dev-from"].appendChild( ( e = document.createElement( "li" ) ) );
                _a( e, _t(src_unit) );
            }
        } else{
            ResultTree["dev-from"].appendChild( ( e = document.createElement( "li" ) ) );
            e.textContent = "なし";
        }
    }

    ResultTree["stage"].replaceChildren();
    if( Object.hasOwn( unit.data, "stage" ) ){
        for( const stage in unit.data.stage ){
            ResultTree["stage"].appendChild( ( e = document.createElement( "li" ) ) );
            e.textContent = _t(stage) + " Stage " + unit.data.stage[stage].join( ", " );
        }
    } else{
        ResultTree["stage"].appendChild( ( e = document.createElement( "li" ) ) );
        e.textContent = "なし";
    }

    ResultTree["note"].replaceChildren();
    if( Object.hasOwn( unit.data, "note" ) && unit.data.note.length ){
        for( const note of unit.data.note ){
            ResultTree["note"].appendChild( ( e = document.createElement( "li" ) ) );
            e.textContent = _t(note);
        }
    } else{
        ResultTree["note"].appendChild( ( e = document.createElement( "li" ) ) );
        e.textContent = "なし";
    }

    ResultTree["code"].replaceChildren();
    if( Object.hasOwn( unit.data, "code" ) && unit.data.code.length ){
        for( const code of unit.data.code ){
            ResultTree["code"].appendChild( ( e = document.createElement( "li" ) ) );
            e.textContent = code;
        }
    } else{
        ResultTree["code"].appendChild( ( e = document.createElement( "li" ) ) );
        e.textContent = "なし";
    }

    return true;
}

function ev_loadhash( e )
{
    const result = document.getElementById( "ggf-unit-db-result" );
    const hash   = decodeURIComponent( location.hash.slice( 1 ) );

    function add_heading( s, label )
    {
        let _h;
        s.appendChild( ( _h = document.createElement( "h3" ) ) );
        _h.textContent = label;
    }

    result.replaceChildren();

    if( ! hash ){
        result.innerHTML = `<pre>直接入力の難しい文字はカタカナに置き換えられています。

  - νガンダム   → ニューガンダム
  - HIνガンダム → HIニューガンダム
  - α・アジール → アルパ・アジール
  - ∀ガンダム   → ターンエーガンダム

など...</pre>`;
        return;
    } else if( hash.charAt( 0 ) === '_' || hash.charAt( 0 ) === '[' ){
        let label;
        let e;
        
        ResultTree["root-allunits"].replaceChildren();
        ResultTree["match"].replaceChildren();

        switch( hash ){
            case "_UNITS":
                label = "全ユニット一覧";
                for( const key of Object.keys( UnitsData ).sort( ( a, b ) => _t( a ).localeCompare( _t( b ), "ja" ) ) ){
                    ResultTree["match"].appendChild( ( e = document.createElement( "li" ) ) );
                    _a( e, _t(key) )
                }
                break;
            case "_CATEGORIES":
                label = "カテゴリ一覧";
                for( const key of Object.keys( Categories ).sort( ( a, b ) => _t( a ).localeCompare( _t( b ), "ja" ) ) ){
                    ResultTree["match"].appendChild( ( e = document.createElement( "li" ) ) );
                    _a( e, _t(key) )
                }
                break;
            default:
                 label = _t(hash);

                const cat = Object.keys( Categories ).find( key => is_match( key, hash, true ) );
                if( cat ){
                    for( const key of Categories[cat].sort( ( a, b ) => _t( a ).localeCompare( _t( b ), "ja" ) ) ){
                        ResultTree["match"].appendChild( ( e = document.createElement( "li" ) ) );
                        _a( e, _t(key) )
                    }
                } else{
                    ResultTree["match"].appendChild( ( e = document.createElement( "li" ) ) );
                    e.textContent = "指定されたカテゴリは存在しません。";
                }
        }

        add_heading( ResultTree["root-allunits"], label );
        ResultTree["root-allunits"].appendChild( ResultTree["match"] );
        result.appendChild( ResultTree["root-allunits"] );
    } else{
        ResultTree["root-search"].replaceChildren();
        document.getElementById("ggf-unit-db-search-name").value = hash;

        search_unit( hash, result );

        ResultTree["root-search"].appendChild( ResultTree["unitname"] );
        add_heading( ResultTree["root-search"], "設計" );
        ResultTree["root-search"].appendChild( ResultTree["design"] );
        add_heading( ResultTree["root-search"], "開発元" );
        ResultTree["root-search"].appendChild( ResultTree["dev-from"] );
        add_heading( ResultTree["root-search"], "開発" );
        ResultTree["root-search"].appendChild( ResultTree["dev-to"] );
        add_heading( ResultTree["root-search"], "ACE登録/捕獲 ステージ例" );
        ResultTree["root-search"].appendChild( ResultTree["stage"] );
        add_heading( ResultTree["root-search"], "備考" );
        ResultTree["root-search"].appendChild( ResultTree["note"] );
        add_heading( ResultTree["root-search"], "黒歴史コード" );
        ResultTree["root-search"].appendChild( ResultTree["code"] );
        ResultTree["root-search"].appendChild( ResultTree["match"] );
        result.appendChild( ResultTree["root-search"] );
    }
}

function init_DOM( rt )
{
    ResultTree["root-search"]   = document.createElement( "div" );
    ResultTree["root-allunits"] = document.createElement( "div" );

    ResultTree["unitname"] = document.createElement( "h2" );
    ResultTree["design"]   = document.createElement( "div" );
    ResultTree["dev-to"]   = document.createElement( "ul" );
    ResultTree["dev-from"] = document.createElement( "ul" );
    ResultTree["stage"]    = document.createElement( "ul" );
    ResultTree["note"]     = document.createElement( "ul" );
    ResultTree["code"]     = document.createElement( "ul" );
    ResultTree["match"]    = document.createElement( "ul" );

    ResultTree["unitname"].id = "unitname";
    ResultTree["design"].id   = "design";
    ResultTree["dev-to"].id   = "development-to";
    ResultTree["dev-from"].id = "development-from";
    ResultTree["stage"].id    = "stage";
    ResultTree["note"].id     = "note";"main"
    ResultTree["code"].id     = "code";
    ResultTree["match"].id    = "match";
}

init_DOM( ResultTree );

document.getElementById( "ggf-unit-db-search" ).addEventListener( "submit", ( event ) => {
    event.preventDefault();

    const query = document.getElementById("ggf-unit-db-search-name").value.trim();

    if( ! query ) return;

    location.hash = encodeURIComponent( query );
} );

window.addEventListener("hashchange", ( e ) => {
    if( ResetScrollPosition ){
        ResetScrollPosition = false;
        requestAnimationFrame( () => { window.scrollTo( 0, 0 ); } );
    }
    ev_loadhash( e );
} );

document.addEventListener( "DOMContentLoaded", ev_loadhash );
