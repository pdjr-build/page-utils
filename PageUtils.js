/**********************************************************************
 * Copyright 2018 Paul Reeve <preeve@pdjr.eu>
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you
 * may not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

class PageUtils {

    static createElement(type, id, classname, content, parentNode) {
        var retval = document.createElement(type);
        if (retval) {
            if (id != null) retval.id = id;
            if (classname != null) retval.className = classname;
            if (content != null) {
                switch(type) {
                    case 'img':
                        retval.src = content;
                        break;
                    default:
                        if (typeof content === "object") {
                            retval.appendChild(content);
                        } else {
                            retval.innerHTML = content;
                        }
                }
            }
        }
        if (parentNode != null) parentNode.appendChild(retval);
        return(retval);
    }
 
    static waitFor(conditionFunction, timeout=500) {
        const poll = resolve => {
            if (conditionFunction()) {
                resolve();
            } else {
                setTimeout(_ => poll(resolve), timeout);
            }
        }
        return new Promise(poll);
    }

    static waitForFlag(flagObject, flagName, timeout=500) {
        const poll = resolve => {
            if (flagObject[flagName]) { resolve(); } else { setTimeout(_ => poll(resolve), timeout); }
        }
        return new Promise(poll);
    }

    /**
     * Return the value associated with <name> from local storage.  If the
     * named value is not defined then return <fallback> and create a new
     * local storage entry for <name>.
     *
     * param name - name of the storage item to be retrieved.
     * param fallback - value to be returned if the named item is not defined.
     */

    static getStorageItem(name, fallback) {
        //console.log("getStorageItem(%s,%s)...", name, fallback);

        var retval = window.localStorage.getItem("pdjr-" + name);
        if ((retval == null) && (fallback !== undefined)) {
            window.localStorage.setItem("pdjr-" + name, fallback);
            retval = fallback;
        }
        return(retval);
    }

    static setStorageItem(name, value) {
        console.log("setStorageItem(%s,%s)...", name, value);

        window.localStorage.setItem("pdjr-" + name, value);
    }

    static getAttributeValue(element, name, subname) {
        //console.log("getAttributeValue(%s,%s,%s)...", JSON.stringify(element), name, subname);
        var retval = undefined;
        if (element.hasAttribute(name)) {
            var value = element.getAttribute(name);
            try {
                retval = JSON.parse(value);
                if ((subname) && (retval[subname])) retval = retval[subname];
            } catch(e) {
                retval = value;
            }
        }
        return(retval);
    }


    /**
     * Synchronously recover the content of some document.
     * @url - URL of the document to be recovered.
     * @return - the content of the document or null on error.
     */
    static httpGet(url) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", url, false);
        xmlHttp.send(null);
        return(xmlHttp.responseText);
    }

	/**
     * Replace the content of an element with an HTML fragment loaded from a
     * specified url.
     *
     * @param element - DOM node or selector.
     * @param url - document to be interpolated.
     * @return - reference to the updated element.  
	 */
	static include(element, url) {
        if ((element) && (typeof element === 'string')) element = document.querySelector(element);
        if ((element) && (url)) {
       	    var html = PageUtils.httpGet(url);
            if (html) {
                element.innerHTML = html;
           	    element.parentNode.replaceChild(element.children[0], element);
            } else {
                throw "PageUtils.include: error loading " + path;
            }
        } else {
            throw "PageUtils.include: invalid argument";
        }
        return(element);
	}

    /**
     * Stop the browser from displaying its default context menu, maybe doing
     * something else instead.
     * @alternateHandler - optional callback to be used instead of the default
     *   right-click hanlder.
     */
    static noRightClick(alternateHandler) {
        document.addEventListener("contextmenu", (e) => { e.preventDefault(); if (alternateHandler) alternateHandler(); });
        window.event.cancelBubble = true;
    }

    /**
     * Walk a DOM sub-tree applying a callback function to selected elements.
     *
     * @container - DOM node or selector specifying a root element.
     * @selector - querySelector() string to use to select target elements.
     * @callback - function to be called for each element selected by selector.
     * @return - count of the number of elements selected.
     */
    static walk(container, selector, callback) {
        var elements = container.querySelectorAll(selector);
        [...elements].forEach(element => callback(element));
        return(elements.length);
    }



	static addHandler(root, selectorclass, eventtype, func) {
		var elements = root.getElementsByClassName(selectorclass);
		[...elements].forEach(element => {
    		if (element.hasAttribute("data-params")) {
        		try {
                    options = JSON.parse(element.getAttribute("data-params"));
                } catch(e) {
                    options = null;
                }
                if (options) {
				    element.addEventListener(eventtype, function(evt) { func(evt.target, params); });
				}
		    }
		});
	}

    
    static loadHTML(container, url, classname, callback) {
        if (container) {
            httpGetAsync(url, (content) => {
                if (content) {
                    container.innerHTML = content;
                    if (classname) container.classname = classname;
                    if (callback) callback(container);
                }
            });
        }
    }

    static httpGetAsync(theUrl, callback) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) callback(xmlHttp.responseText);
        }
        xmlHttp.open("GET", theUrl, true); // true for asynchronous 
        xmlHttp.send(null);
    }


    static activateEventListeners(classname, eventtype, callback) {
        var elements = document.getElementsByClassName(classname);
        for (var i = 0; i < elements.length; i++) elements[i].addEventListener(eventtype, callback);
    }

}
