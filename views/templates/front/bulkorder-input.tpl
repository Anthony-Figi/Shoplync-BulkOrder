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
            <label for="partNumberList">Please Enter A Comma Seperated List</label>
            <section style="text-transform: capitalize;">
                <textarea class="form-control" id="partNumberList" name="partNumberList" title="Part Number List" placeholder="123456, PP-246, 123-456" rows="4" cols="50" required>{if isset($productList)}{implode(",", $productList)}{/if}</textarea>
                <input type="radio" id="list_type_1" name="list_type" value="false" checked required>
                <label for="list_type_1" class="list_type" title="A comma delimited list of part numbers only. In the following format: partNumber1,partNumber2,partNumber3">Parts List Only</label>
                <input type="radio" id="list_type_2" name="list_type" value="true" required>
                <label for="list_type_2" class="list_type" title="A comma delimited list in the following format: partNumber,orderQuantity">Parts List + Quantity</label>
                <button id="choose_file_btn" class="btn btn-primary mt-1 float-xs-right" onclick="event.preventDefault(); document.getElementById('getFile').click();">Upload SMS File</button>
                <input type='file' id="getFile" style="display:none">
            </section>
            
            {block name='customer_form_footer'}
            <footer class="form-footer clearfix my-1">
              <input type="hidden" name="submitCreate" value="1">
              {block "form_buttons"}
                <button class="btn btn-primary form-control-submit float-xs-left" id="add_to_cart">
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
            {l s='There are no products to display please enter a list of comma seperated part numbers. Then click the refresh button.' mod='BulkOrder'}
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