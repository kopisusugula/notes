---
layout: post
title: La méthode de DHH pour organiser les contrôleurs Rails
date: 2016-02-19 23:00
category: ruby
parmalink: /la-methode-de-dhh-pour-organiser-les-controleurs-rails/
image: /uploads/2016-02-20-la-methode-de-dhh-pour-organiser-les-controleurs-rails/basecamp3.png
---

Dans [une interview](http://www.fullstackradio.com/32), [David Heinemeier Hansson](https://twitter.com/dhh) a partagé une pratique mise en place pour la réécriture de [Basecamp](https://basecamp.com/) pour la version 3.

Basecamp comporte beaucoup de contrôleurs comme le montre le [`rails stats`](https://twitter.com/dhh/status/700724641812377602):

![Stats Basecamp 3](/uploads/2016-02-20-la-methode-de-dhh-pour-organiser-les-controleurs-rails/basecamp3.png)

DHH a justifié ce nombre par le fait que lui et son équipe ont décidé que tout ce qui n'était pas une méthode REST devait conduire à la création d'un nouveau contrôleur.

Donc les contôleurs doivent comporter uniquement les méthodes:

- `index`
- `show`
- `new`
- `create`
- `edit`
- `update`
- `destroy`

Tout ajout d'une autre méthode conduit à la création d'un nouveau contrôleur.

Par exemple:

**Avant:**

```ruby
class InboxesController < ApplicationController
  before_action :foo, only: [:show]
  before_action :bar, only: [:pending]
  before_action :baz, only: [:drafts]

  def show
  end

  def index
  end

  def pendings
  end

  def drafts
  end
end
```

**Après:**

```ruby
class InboxesController < ApplicationController
  before_action :foo, only: [:show]

  def show
  end

  def index
  end
end
```

```ruby
class Inboxes::PendingsController < ApplicationController
  before_action :bar, only: [:index]

  def index
  end
end
```

```ruby
class Inboxes::DraftsController < ApplicationController
  before_action :baz, only: [:index]

  def index
  end
end
```
