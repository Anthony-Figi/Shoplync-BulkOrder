{*
* @author    Anthony Figueroa - Shoplync Inc <sales@shoplync.com>
* @copyright 2021 Shoplync
* @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
* @category  PrestaShop module
* @package   Bulk Purchase Order
*      International Registered Trademark & Property of Shopcreator
* @version   1.0.0
* @link      http://www.shoplync.com/
*}

<!-- MODULE BulkOrder -->
{if $psversion >= 1.7}
  <a class="col-lg-4 col-md-6 col-sm-6 col-xs-12" id="shoplync-bulkorder" href="{$link->getModuleLink('BulkOrder', 'new', array(), true)|escape:'htmlall':'UTF-8'}" title="{l s='Bulk Purchase Order' mod='BulkOrder'}">
  <span class="link-item">
  <i class="material-icons">local_mall</i>
  {l s='Bulk Order' mod='BulkOrder'}
  </span>
  </a>
{else}
  <li class="lnk_bulkorder">
      <a href="{$link->getModuleLink('BulkOrder', 'new', array(), true)|escape:'htmlall':'UTF-8'}" title="{l s='Bulk Purchase Order' mod='bulkorder'}">
          <i class="icon-list"></i>
          <span>{l s='Bulk Order' mod='BulkOrder'}</span>
      </a>
  </li>
{/if}
<!-- END : MODULE BulkOrder -->
