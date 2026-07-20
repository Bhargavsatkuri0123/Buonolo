package com.buonolo.app.ui.common

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.CreationExtras

/** Wraps a zero-arg constructor lambda as a Factory, so screens can do `viewModel { MyVm(container) }`-style creation. */
class LambdaViewModelFactory<T : ViewModel>(private val create: () -> T) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <VM : ViewModel> create(modelClass: Class<VM>, extras: CreationExtras): VM = create() as VM
}
