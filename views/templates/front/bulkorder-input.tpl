<!-- BulkOrder - Block customer account -->
{extends file='page.tpl'}
{block name='page_content'}


<script type="text/javascript"> 
  var controllerURL = "{$link->getModuleLink('BulkOrder', 'new', array(), true)|escape:'htmlall':'UTF-8'}"; 
  var link_token = "{$link_token|default:''}";
</script>
<div id="bulk-order">
    <h1 class="h1 title">
        {l s='Bulk Purchase Order' mod='BulkOrder'}
    </h1>
    <div class="clr_10"></div>
    
    <section id="content" class="page-content">
        <h3 class="h3">{l s='Generate A New Order' mod='BulkOrder'}</h3>
            <div class="clr_10"></div>
        
        <form action="{$link->getModuleLink('BulkOrder', 'new')|escape:'html'}" id="submit_parts" class="js-customer-form" method="post">
            <section style="text-transform: capitalize;">
                <input type="radio" id="mpn_format" name="format_type" value="true" checked required>
                <label for="mpn_format" class="format_type" title="Required Format 0000-12345">SKU Format</label>
                <input type="radio" id="sku_format" name="format_type" value="false" required>
                <label for="sku_format" class="format_type" title="MPN varies by manufacture">MPN Format</label>
                
                <div class="tab">
                  <button id="manualList" class="tablinks active" onclick="changeTab(event, 'manualInput');" type="button">Enter Part Numbers</button>
                  <button id="pasteList" class="tablinks" onclick="changeTab(event, 'textBoxList');" type="button">Paste List</button>
                </div>

                <!-- Tab Pages -->
                <div id="manualInput" class="tabcontent text-center" style="display: block;">
                    <div id="inputContainer" class="mt-1">
                        <h1 class="d-inline-block">Part Number</h1>
                        <h1 class="d-inline-block">Quantity</h1>                    
                        <h1 class="d-inline-block">Part Number</h1>
                        <h1 class="d-inline-block">Quantity</h1>
                        <input class="form-control form-control-md d-inline-block" tabindex="1" type="text" name="partNumbers[]" value="" maxlength="26" size="12">
                        <input class="form-control form-control-md d-inline-block" tabindex="2" type="number" name="partQty[]" value="1" min="1">
                        <input class="form-control form-control-md d-inline-block" tabindex="3" type="text" name="partNumbers[]" value="" maxlength="26" size="12">
                        <input class="form-control form-control-md d-inline-block" tabindex="4" type="number" name="partQty[]" value="1" min="1">
                        <input class="form-control form-control-md d-inline-block" tabindex="5" type="text" name="partNumbers[]" value="" maxlength="26" size="12">
                        <input class="form-control form-control-md d-inline-block" tabindex="6" type="number" name="partQty[]" value="1" min="1">
                        <input class="form-control form-control-md d-inline-block" tabindex="7" type="text" name="partNumbers[]" value="" maxlength="26" size="12">
                        <input class="form-control form-control-md d-inline-block" tabindex="8" type="number" name="partQty[]" value="1" min="1">
                        <input class="form-control form-control-md d-inline-block" tabindex="9" type="text" name="partNumbers[]" value="" maxlength="26" size="12">
                        <input class="form-control form-control-md d-inline-block" tabindex="10" type="number" name="partQty[]" value="1" min="1">
                        <input class="form-control form-control-md d-inline-block" tabindex="11" type="text" name="partNumbers[]" value="" maxlength="26" size="12">
                        <input class="form-control form-control-md d-inline-block" tabindex="12" type="number" name="partQty[]" value="1" min="1">
                        <input class="form-control form-control-md d-inline-block" tabindex="13" type="text" name="partNumbers[]" value="" maxlength="26" size="12">
                        <input class="form-control form-control-md d-inline-block" tabindex="14" type="number" name="partQty[]" value="1" min="1">
                        <input class="form-control form-control-md d-inline-block" tabindex="15" type="text" name="partNumbers[]" value="" maxlength="26" size="12">
                        <input class="form-control form-control-md d-inline-block" tabindex="16" type="number" name="partQty[]" value="1" min="1">
                        <input class="form-control form-control-md d-inline-block" tabindex="17" type="text" name="partNumbers[]" value="" maxlength="26" size="12">
                        <input class="form-control form-control-md d-inline-block" tabindex="18" type="number" name="partQty[]" value="1" min="1">
                        <input class="form-control form-control-md d-inline-block" tabindex="19" type="text" name="partNumbers[]" value="" maxlength="26" size="12">
                        <input class="form-control form-control-md d-inline-block" tabindex="20" type="number" name="partQty[]" value="1" min="1">
                    </div>
                    <button type="button" class="btn btn-primary my-1" onclick="addPartsRow();">+ Add More Parts</button>
                    <input type="reset" value="Reset" class="btn btn-primary d-block mx-auto">
                </div>

                <div id="textBoxList" class="tabcontent">
                    <br>
                    <label for="partNumberList">Please Enter A Comma Seperated List: </label>
                    <br><br>
                    <textarea class="form-control" id="partNumberList" name="partNumberList" title="Part Number List" placeholder="123456, PP-246, 123-456" rows="10" cols="50">{if isset($productList)}{implode(",", $productList)}{/if}</textarea>
                    <input type="radio" id="list_type_1" name="list_type" value="false" checked required>
                    <label for="list_type_1" class="list_type" title="A comma delimited list of part numbers only. In the following format: partNumber1,partNumber2,partNumber3">Parts List Only</label>
                    <input type="radio" id="list_type_2" name="list_type" value="true" required>
                    <label for="list_type_2" class="list_type" title="A comma delimited list in the following format: partNumber,orderQuantity">Parts List + Quantity</label>
                    <h6 style="text-transform: none;" class="alert-text font-italic">Note: Combo MPN's which contain a comma are not supported with this method, use the corresponding SKU number instead.</h6>
                    <input type="reset" value="Reset" class="btn btn-primary d-block mx-auto">
                </div>
                <!--/ Tab Pages -->
                <button id="choose_file_btn" class="btn btn-primary my-1 float-sm-right" onclick="selectFile(this);" type="button">Select File</button>
                <input type='file' id="getFile" style="display:none">
                <select name="file_type" id="file_type" class="mx-1 my-1 float-sm-right" onchange="fileTypeSelected(this);">
                  <option value="" selected="selected">&lt;---Select File Type---&gt;</option>
                  <option value="CSV1">CSV File: Part #,Qty</option>
                  <option value="CSV2">CSV File: Qty,Part #</option>
                  <option value="CSV3">Tab Delim: Part #,Qty</option>
                  <option value="CSV4">Tab Delim: Qty,Part #</option>
                  <option value="CSV5">CSV File: Part # (No Qty)</option>
                  <option value="SMS" disabled>Shoplync SMS Pro</option>
                  <option value="BT" disabled>BiT Software</option>
                  <option value="LS" disabled>CDK LightSpeed</option>
                  <option value="CS" disabled>cSystems Software</option>
                  <option value="CT" disabled>Comptron</option>
                  <option value="CM" disabled>Counterman</option>
                  <option value="ZS" disabled>DX1 / ZiiOs</option>
                  <option value="ID" disabled>Ideal Systems</option>
                  <option value="BS" disabled>MIC Brainstorm</option>
                  <option value="MC" disabled>MIC Commander</option>
                  <option value="NS" disabled>NextStep DMS</option>
                  <option value="NZ" disabled>NizeX</option>
                  <option value="PM" disabled>PartsManager Pro</option>
                  <option value="SC" disabled>SoftCom PowerPro</option>
                  <option value="TL" disabled>TALONes</option>
                </select>
                
            </section>
            
            {block name='customer_form_footer'}
            <footer class="form-footer clearfix my-1">
              <input type="hidden" name="submitCreate" value="1">
              {block "form_buttons"}
                <button class="btn btn-primary form-control-submit float-xs-left" id="add_to_cart" type="button">
                  {l s='Add To Cart' d='Shop.Theme.Actions'}
                </button>
                <button class="btn btn-primary form-control-submit float-xs-right" data-link-action="submit_parts" name="submit_parts" type="submit">
                  {l s='Refresh List' d='Shop.Theme.Actions'}
                </button>
              {/block}
            </footer>
            {/block}
        </form>
        <div class="clr_hr"></div>
        <div class="clr_10"></div>
        <div id="ListContainer">
        {if isset($productDetailsList)}
            <!-- Product List -->
            <h1>Grid</h1>
            <ul>
            {foreach from=$productDetailsList item=product name=i}
            {assign 'productInfoArray' [$product.manufacturer_name, $product.name, $product.description, $product.reference]}
            <li>{implode(",", $productInfoArray)}</li>
            {/foreach}
            </ul>
        {else}
        <div class="alert alert-warning" id="noProductsInList">
            {l s='There are no products to display, please enter SKU / MPN values. Then click the refresh button.' mod='BulkOrder'}
        </div>
        {/if}
        </div>
    </section>
   
    {*<footer class="page-footer">
    <a href="{$sMyAccountLink|escape:'htmlall':'UTF-8'}" class="account-link">
        <i class="material-icons">&#xE5CB;</i>
        <span>{l s='Back to Your Account' mod='BulkOrder'}</span>
    </a>
    <a href="{$sBASE_URI|escape:'htmlall':'UTF-8'}" class="account-link">
        <i class="material-icons">&#xE88A;</i>
        <span>{l s='Home' mod='BulkOrder'}</span>
    </a>
    </footer>*}
</div>

{/block}
<!-- /BulkOrder - Block customer account -->